import "server-only";

import { cookies } from "next/headers";
import { createPublicClient } from "@/lib/supabase/server";
import type { TrackedOrder } from "./types";

const ORDER_ACCESS_COOKIE = "grip-order-access";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type OrderAccess = {
  number: string;
  contact: string;
};

export async function getTrackedOrder(
  orderNumber: string,
  contact: string,
): Promise<TrackedOrder | null> {
  const number = orderNumber.trim();
  const value = contact.trim();
  if (!number || !value) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("track_order", {
    p_order_number: number,
    p_contact: value,
  });

  if (error) {
    console.error(`Track order failed: ${error.message}`);
    return null;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

  const order = data as unknown as TrackedOrder;
  if (!order.order_number || !Array.isArray(order.items)) return null;

  return order;
}

export async function setOrderAccess(orderNumber: string, contact: string) {
  const store = await cookies();
  const value = encodeURIComponent(JSON.stringify({ number: orderNumber, contact }));

  store.set(ORDER_ACCESS_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readOrderAccess(): Promise<OrderAccess | null> {
  const store = await cookies();
  const raw = store.get(ORDER_ACCESS_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<OrderAccess>;
    if (typeof parsed.number !== "string" || typeof parsed.contact !== "string") return null;
    return { number: parsed.number, contact: parsed.contact };
  } catch {
    return null;
  }
}
