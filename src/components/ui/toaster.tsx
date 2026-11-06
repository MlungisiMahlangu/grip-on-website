"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useToastStore, type ToastTone } from "@/lib/toast";
import { cn } from "@/lib/utils";

const ICONS: Record<ToastTone, typeof Info> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const TONES: Record<ToastTone, string> = {
  success: "border-emerald-400/30 text-emerald-300",
  error: "border-red-400/40 text-red-300",
  info: "border-accent/40 text-accent",
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      {toasts.map((item) => {
        const Icon = ICONS[item.tone];

        return (
          <div
            key={item.id}
            role={item.tone === "error" ? "alert" : "status"}
            className={cn(
              "animate-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--radius-card)] border bg-ink-raised px-4 py-3 shadow-2xl",
              TONES[item.tone],
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-bone">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss notification"
              className="-my-2 -mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-bone-dim transition-colors hover:text-bone"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
