import type { OrderStatus } from "@/lib/supabase/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Order received",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function formatOrderDate(value: string, withTime = false) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Africa/Johannesburg",
  }).format(new Date(value));
}

export function orderSizeLabel(size: string) {
  return size === "ONE_SIZE" ? "One size" : size;
}
