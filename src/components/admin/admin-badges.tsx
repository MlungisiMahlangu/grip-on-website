"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export type AdminBadgeCounts = {
  orders: number;
  messages: number;
};

const EMPTY: AdminBadgeCounts = { orders: 0, messages: 0 };

function beep() {
  try {
    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.28);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.3);
    oscillator.onended = () => void context.close();
  } catch {
    // Sound is optional. Browsers block it until the admin interacts with the page.
  }
}

export function useAdminBadges(): AdminBadgeCounts {
  const [counts, setCounts] = useState<AdminBadgeCounts>(EMPTY);
  const previousOrders = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    const load = async () => {
      try {
        const response = await fetch("/api/admin/badges", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as Partial<AdminBadgeCounts>;
        if (!active) return;

        const next = {
          orders: Number(data.orders ?? 0),
          messages: Number(data.messages ?? 0),
        };

        if (previousOrders.current !== null && next.orders > previousOrders.current) {
          toast.info(
            next.orders === 1 ? "A new order has arrived." : `${next.orders} orders need attention.`,
          );
          beep();
        }

        previousOrders.current = next.orders;
        setCounts(next);
      } catch {
        // Keep the last known counts when the network is unavailable.
      }
    };

    void load();
    const interval = window.setInterval(load, 60_000);

    const onFocus = () => void load();
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    const channel = supabase
      .channel("admin-badges")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void load())
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        () => void load(),
      )
      .subscribe();

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const total = counts.orders + counts.messages;
    const original = document.title;
    document.title = total > 0 ? `(${total}) Grip On Admin` : original;

    return () => {
      document.title = original;
    };
  }, [counts.orders, counts.messages]);

  return counts;
}
