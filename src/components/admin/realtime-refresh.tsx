"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type RealtimeStatus = "connecting" | "live" | "offline";

export function RealtimeRefresh({ channelName }: { channelName: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scheduleRefresh = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        startTransition(() => router.refresh());
      }, 500);
    };

    const channel = supabase
      .channel(`admin-${channelName}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, scheduleRefresh)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_events" },
        scheduleRefresh,
      )
      .subscribe((state) => {
        if (state === "SUBSCRIBED") setStatus("live");
        else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT" || state === "CLOSED") {
          setStatus("offline");
        } else setStatus("connecting");
      });

    return () => {
      if (timer.current) clearTimeout(timer.current);
      supabase.removeChannel(channel);
    };
  }, [channelName, router, supabase]);

  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-bone-dim"
        title={
          status === "live"
            ? "Live updates are connected"
            : "Live updates are not connected. Use refresh."
        }
      >
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            status === "live" ? "bg-emerald-400" : status === "connecting" ? "bg-accent" : "bg-bone-dim",
          )}
        />
        {status === "live" ? "Live" : status === "connecting" ? "Connecting" : "Offline"}
      </span>
      <button
        type="button"
        onClick={() => startTransition(() => router.refresh())}
        disabled={isPending}
        className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] border border-line text-bone-dim transition-colors hover:border-bone hover:text-bone disabled:opacity-50"
        aria-label="Refresh data"
      >
        <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} aria-hidden="true" />
      </button>
    </div>
  );
}
