"use client";

import { useEffect } from "react";
import { markOrderViewedAction } from "@/lib/admin/order-actions";

export function MarkOrderViewed({ orderId }: { orderId: string }) {
  useEffect(() => {
    void markOrderViewedAction(orderId);
  }, [orderId]);

  return null;
}
