"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { updateOrderStatusAction, type OrderActionState } from "@/lib/admin/order-actions";
import type { OrderStatus } from "@/lib/supabase/types";
import { buttonClasses } from "@/components/ui/button";
import { TextAreaField } from "@/components/ui/form-field";

const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  confirmed: "Confirm order",
  packed: "Mark packed",
  shipped: "Mark shipped",
  delivered: "Mark delivered",
};

const initialState: OrderActionState = {};

export function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [state, formAction, pending] = useActionState(updateOrderStatusAction, initialState);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const next = NEXT[status].filter((value) => value !== "cancelled");
  const canCancel = NEXT[status].includes("cancelled");

  if (next.length === 0 && !canCancel) {
    return (
      <p className="rounded-[var(--radius-card)] border border-line bg-ink-soft px-4 py-3 text-sm leading-relaxed text-bone-dim">
        This order is closed. No further status changes are possible.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

      {state.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-card)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm leading-relaxed text-red-300"
        >
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-[var(--radius-card)] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm leading-relaxed text-emerald-300"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.success}
        </p>
      ) : null}

      <TextAreaField
        label="Update note"
        name="note"
        rows={3}
        maxLength={500}
        placeholder="Courier name, tracking reference or a short note for the customer"
        hint="Optional. Shown on the customer timeline and included in the status email."
      />

      {next.map((value) => (
        <button
          key={value}
          type="submit"
          name="status"
          value={value}
          disabled={pending}
          className={buttonClasses("primary", "w-full")}
        >
          {pending ? "Saving…" : ACTION_LABELS[value]}
        </button>
      ))}

      {canCancel ? (
        confirmCancel ? (
          <div className="rounded-[var(--radius-card)] border border-red-400/40 bg-red-400/5 p-4">
            <p className="text-sm font-medium text-bone">Cancel this order?</p>
            <p className="mt-1 text-xs leading-relaxed text-bone-dim">
              Stock is returned to inventory and the customer is emailed. This cannot be undone.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                name="status"
                value="cancelled"
                disabled={pending}
                className={buttonClasses("primary", "flex-1 bg-red-400 text-ink hover:bg-red-300")}
              >
                <XCircle aria-hidden="true" />
                {pending ? "Cancelling…" : "Confirm cancel"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmCancel(false)}
                disabled={pending}
                className={buttonClasses("secondary", "flex-1")}
              >
                Keep order
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmCancel(true)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border border-line px-4 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:border-red-400/50 hover:text-red-300"
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Cancel order
          </button>
        )
      ) : null}
    </form>
  );
}
