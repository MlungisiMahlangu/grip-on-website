"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "@/lib/zod-config";
import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS_LABELS } from "@/lib/orders/format";
import { getTrackedOrder } from "@/lib/orders/track";
import { sendOrderStatusEmail } from "@/lib/email/order-emails";
import { formatPriceCents } from "@/lib/utils";
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

export async function markOrderViewedAction(orderId: string) {
  try {
    await assertAdmin();
  } catch {
    return;
  }

  if (!z.uuid().safeParse(orderId).success) return;

  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ admin_viewed_at: new Date().toISOString() })
    .eq("id", orderId)
    .is("admin_viewed_at", null);
}

export async function deleteOrderAction(formData: FormData) {
  await assertAdmin();

  const parsed = z.uuid().safeParse(formData.get("id"));
  if (!parsed.success) throw new Error("Invalid order.");

  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", parsed.data)
    .maybeSingle();

  if (orderError) throw new Error(orderError.message);
  if (!order) throw new Error("That order no longer exists.");
  if (order.status !== "cancelled") throw new Error("Only cancelled orders can be deleted.");

  const { error } = await supabase.from("orders").delete().eq("id", order.id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  redirect("/admin/orders?deleted=1");
}

const deliveryQuoteSchema = z.object({
  orderId: z.uuid(),
  fee: z.coerce
    .number()
    .min(0, "Enter a delivery fee of 0 or more.")
    .max(100000, "That delivery fee is too high."),
  confirmed: z.literal("on", "Confirm the delivery fee with the customer first."),
});

export async function setDeliveryQuoteAction(
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

  const parsed = deliveryQuoteSchema.safeParse({
    orderId: formData.get("orderId"),
    fee: formData.get("fee"),
    confirmed: formData.get("confirmed"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the delivery fee." };
  }

  const { orderId } = parsed.data;
  const feeCents = Math.round(parsed.data.fee * 100);
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, delivery_area, total_cents, delivery_fee_cents, delivery_quote_required",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) return { error: orderError.message };
  if (!order) return { error: "That order no longer exists." };

  if (order.status === "cancelled" || order.status === "delivered") {
    return { error: "This order is closed. The delivery fee can no longer change." };
  }

  if (!order.delivery_quote_required && order.delivery_area === "johannesburg") {
    return { error: "This order includes free delivery in Johannesburg. No quote is needed." };
  }

  const totalCents = order.total_cents - order.delivery_fee_cents + feeCents;

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      delivery_fee_cents: feeCents,
      total_cents: totalCents,
      delivery_quote_required: false,
    })
    .eq("id", order.id);

  if (updateError) return { error: `Delivery not updated: ${updateError.message}` };

  const { error: eventError } = await supabase.from("order_events").insert({
    order_id: order.id,
    status: order.status,
    note:
      feeCents === 0
        ? "Delivery confirmed free."
        : `Delivery quoted at ${formatPriceCents(feeCents)}.`,
    created_by: adminId,
  });

  if (eventError) {
    return { error: `Delivery fee saved but the timeline entry failed: ${eventError.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath(`/order/${order.order_number}`);
  revalidatePath("/track-order");

  return {
    success:
      feeCents === 0
        ? "Delivery recorded as free. The order total is unchanged."
        : `Delivery fee recorded. Total updated to ${formatPriceCents(totalCents)}.`,
  };
}
