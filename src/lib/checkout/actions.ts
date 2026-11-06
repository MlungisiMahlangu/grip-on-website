"use server";

import { z } from "@/lib/zod-config";
import { createPublicClient } from "@/lib/supabase/server";
import { sendOrderEmails } from "@/lib/email/order-emails";
import { getTrackedOrder, setOrderAccess } from "@/lib/orders/track";
import type { TrackedOrder } from "@/lib/orders/types";
import { checkRateLimit, requestKey, retryMessage } from "@/lib/rate-limit";
import type { DiscountKind } from "@/lib/supabase/types";
import { checkoutPayloadSchema, trackOrderSchema } from "./schema";

export type PlaceOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; message: string };

export type AppliedDiscount = {
  code: string;
  kind: DiscountKind;
  value: number;
  minSubtotalCents: number;
  amountCents: number;
  description: string | null;
};

export type ApplyDiscountResult =
  | { ok: true; discount: AppliedDiscount }
  | { ok: false; message: string };

const discountRequestSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Enter a code.")
    .max(30, "That code is too long.")
    .transform((value) => value.toUpperCase()),
  subtotalCents: z.coerce.number().int().min(0).max(10_000_000),
});

const discountResponseSchema = z
  .object({
    valid: z.boolean(),
    message: z.string().optional(),
    code: z.string().optional(),
    kind: z.enum(["percent", "fixed"]).optional(),
    value: z.number().optional(),
    min_subtotal_cents: z.number().optional(),
    amount_cents: z.number().optional(),
    description: z.string().nullable().optional(),
  })
  .passthrough();

export async function applyDiscountAction(
  codeInput: string,
  subtotalCents: number,
): Promise<ApplyDiscountResult> {
  const parsed = discountRequestSchema.safeParse({ code: codeInput, subtotalCents });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check that code." };
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("validate_discount", {
    p_code: parsed.data.code,
    p_subtotal_cents: parsed.data.subtotalCents,
  });

  if (error) {
    console.error(`validate_discount failed: ${error.message}`);
    return { ok: false, message: "We couldn't check that code. Try again." };
  }

  const result = discountResponseSchema.safeParse(data);
  if (!result.success) {
    return { ok: false, message: "We couldn't check that code. Try again." };
  }

  const value = result.data;
  if (!value.valid) {
    return { ok: false, message: value.message ?? "That discount code is not valid." };
  }

  return {
    ok: true,
    discount: {
      code: value.code ?? parsed.data.code,
      kind: value.kind ?? "percent",
      value: value.value ?? 0,
      minSubtotalCents: value.min_subtotal_cents ?? 0,
      amountCents: value.amount_cents ?? 0,
      description: value.description ?? null,
    },
  };
}

export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const limited = checkRateLimit(await requestKey("checkout"), 10, 10 * 60_000);
  if (!limited.ok) {
    return { ok: false, message: retryMessage(limited.retryAfterSeconds) };
  }

  const parsed = checkoutPayloadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Check your details and try again.",
    };
  }

  const { customer, items, subscribe, idempotencyKey } = parsed.data;
  const supabase = createPublicClient();

  const { data, error } = await supabase.rpc("create_order", {
    payload: {
      items: items.map((item) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
      })),
      customer: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address_line1: customer.addressLine1,
        address_line2: customer.addressLine2 || null,
        suburb: customer.suburb,
        city: customer.city,
        province: customer.province,
        postal_code: customer.postalCode,
        delivery_area: customer.deliveryArea,
        delivery_notes: customer.deliveryNotes || null,
      },
      discount_code: null,
      subscribe: subscribe === true,
      idempotency_key: idempotencyKey,
    },
  });

  if (error) {
    if (error.code === "22023") {
      return { ok: false, message: error.message };
    }

    console.error(`create_order failed: ${error.message}`);
    return {
      ok: false,
      message: "We couldn't place your order. Try again in a moment.",
    };
  }

  const created = Array.isArray(data) ? data[0] : null;
  if (!created?.order_number) {
    return {
      ok: false,
      message: "We couldn't confirm your order. Try again in a moment.",
    };
  }

  await setOrderAccess(created.order_number, customer.email);

  try {
    const order = await getTrackedOrder(created.order_number, customer.email);
    if (order) await sendOrderEmails(order, customer);
  } catch (emailError) {
    console.error(`Order ${created.order_number} email failed`, emailError);
  }

  return { ok: true, orderNumber: created.order_number };
}

export type TrackOrderFieldErrors = {
  orderNumber?: string;
  contact?: string;
};

export type TrackOrderState = {
  status: "idle" | "error" | "notfound" | "found";
  message?: string;
  fieldErrors?: TrackOrderFieldErrors;
  order?: TrackedOrder;
  orderNumber?: string;
  contact?: string;
};

export async function trackOrderAction(
  _previous: TrackOrderState,
  formData: FormData,
): Promise<TrackOrderState> {
  const limited = checkRateLimit(await requestKey("track-order"), 20, 10 * 60_000);
  if (!limited.ok) {
    return { status: "error", message: retryMessage(limited.retryAfterSeconds) };
  }

  const parsed = trackOrderSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
    contact: formData.get("contact"),
  });

  const raw = {
    orderNumber: String(formData.get("orderNumber") ?? ""),
    contact: String(formData.get("contact") ?? ""),
  };

  if (!parsed.success) {
    const fieldErrors: TrackOrderFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "orderNumber" && !fieldErrors.orderNumber) {
        fieldErrors.orderNumber = issue.message;
      }
      if (key === "contact" && !fieldErrors.contact) {
        fieldErrors.contact = issue.message;
      }
    }

    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check your details and try again.",
      fieldErrors,
      ...raw,
    };
  }

  const order = await getTrackedOrder(parsed.data.orderNumber, parsed.data.contact);
  if (!order) {
    return {
      status: "notfound",
      message: "We couldn't find that order. Check the number and the contact used at checkout.",
      ...parsed.data,
    };
  }

  return {
    status: "found",
    order,
    orderNumber: order.order_number,
    contact: parsed.data.contact,
  };
}
