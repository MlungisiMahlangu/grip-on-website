"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS_LABELS } from "@/lib/orders/format";
import { getTrackedOrder } from "@/lib/orders/track";
import { sendOrderStatusEmail } from "@/lib/email/order-emails";
import type { OrderStatus } from "@/lib/supabase/types";

export type OrderActionState = {
  error?: string;
  success?: string;
};

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const statusSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"]),
  note: z.string().trim().max(500).optional(),
});

export async function updateOrderStatusAction(
  _previous: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  let adminId: string;
  try {
    const session = await assertAdmin();
    adminId = session.userId;
  } catch {
    return { error: "Admin access required." };
  }

  const parsed = statusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    note: formData.get("note")?.toString() || undefined,
  });

  if (!parsed.success) {
    return { error: "Choose a valid order status." };
  }

  const { orderId, status, note } = parsed.data;
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) return { error: orderError.message };
  if (!order) return { error: "That order no longer exists." };

  if (!TRANSITIONS[order.status].includes(status)) {
    return {
      error: `Cannot move an order from ${ORDER_STATUS_LABELS[order.status]} to ${ORDER_STATUS_LABELS[status]}.`,
    };
  }

  const paymentStatus =
    status === "delivered"
      ? "paid"
      : status === "cancelled" && order.payment_status === "paid"
        ? "refunded"
        : order.payment_status;

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status, payment_status: paymentStatus })
    .eq("id", order.id);

  if (updateError) return { error: `Order not updated: ${updateError.message}` };

  const { error: eventError } = await supabase.from("order_events").insert({
    order_id: order.id,
    status,
    note: note || null,
    created_by: adminId,
  });

  if (eventError) {
    return { error: `Status changed but the timeline entry failed: ${eventError.message}` };
  }

  if (status === "cancelled") {
    const { data: items } = await supabase
      .from("order_items")
      .select("variant_id, quantity")
      .eq("order_id", order.id);

    for (const item of items ?? []) {
      if (!item.variant_id) continue;

      const { data: variant } = await supabase
        .from("product_variants")
        .select("stock_quantity")
        .eq("id", item.variant_id)
        .maybeSingle();

      if (!variant) continue;

      await supabase
        .from("product_variants")
        .update({ stock_quantity: variant.stock_quantity + item.quantity })
        .eq("id", item.variant_id);
    }

    revalidatePath("/admin/inventory");
    revalidatePath("/products/[slug]", "page");
  }

  try {
    const tracked = await getTrackedOrder(order.order_number, order.customer_email);
    if (tracked) {
      await sendOrderStatusEmail(tracked, order.customer_email, status, note || null);
    }
  } catch (error) {
    console.error("[email] status update failed", error);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath(`/order/${order.order_number}`);
  revalidatePath("/track-order");

  return { success: `Order marked ${ORDER_STATUS_LABELS[status].toLowerCase()}.` };
}
