"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { updateOrderStatusAction, type OrderActionState } from "@/lib/admin/order-actions";
import type { OrderStatus } from "@/lib/supabase/types";
import { toast } from "@/lib/toast";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  const [confirmStatus, setConfirmStatus] = useState<"delivered" | "cancelled" | null>(null);
  const deliveredRef = useRef<HTMLButtonElement>(null);
  const cancelledRef = useRef<HTMLButtonElement>(null);
  const next = NEXT[status].filter((value) => value !== "cancelled" && value !== "delivered");
  const canDeliver = NEXT[status].includes("delivered");
  const canCancel = NEXT[status].includes("cancelled");

  useEffect(() => {
    if (state.success) toast.success(state.success);
  }, [state.success]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  if (next.length === 0 && !canCancel && !canDeliver) {
    return (
      <p className="rounded-[var(--radius-card)] border border-line bg-ink-soft px-4 py-3 text-sm leading-relaxed text-bone-dim">
        This order is closed. No further status changes are possible.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

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

      {canDeliver ? (
        <button
          type="button"
          onClick={() => setConfirmStatus("delivered")}
          disabled={pending}
          className={buttonClasses("primary", "w-full")}
        >
          Mark delivered
        </button>
      ) : null}

      {canCancel ? (
        <button
          type="button"
          onClick={() => setConfirmStatus("cancelled")}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border border-line px-4 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:border-red-400/50 hover:text-red-300"
        >
          <XCircle className="h-4 w-4" aria-hidden="true" />
          Cancel order
        </button>
      ) : null}

      <button ref={deliveredRef} type="submit" name="status" value="delivered" className="hidden" tabIndex={-1} aria-hidden="true" />
      <button ref={cancelledRef} type="submit" name="status" value="cancelled" className="hidden" tabIndex={-1} aria-hidden="true" />

      <ConfirmDialog
        open={confirmStatus !== null}
        onClose={() => setConfirmStatus(null)}
        onConfirm={() => {
          const target = confirmStatus === "delivered" ? deliveredRef.current : cancelledRef.current;
          setConfirmStatus(null);
          target?.click();
        }}
        title={
          confirmStatus === "delivered" ? "Mark this order delivered?" : "Cancel this order?"
        }
        description={
          confirmStatus === "delivered"
            ? "This closes the order and records cash on delivery as paid. It cannot be undone."
            : "The customer is emailed and the order is closed. This cannot be undone."
        }
        confirmLabel={confirmStatus === "delivered" ? "Mark delivered" : "Cancel order"}
        cancelLabel={confirmStatus === "delivered" ? "Go back" : "Keep order"}
        pending={pending}
      >
        {confirmStatus === "delivered"
          ? "Only mark delivered once the customer has the order and has paid."
          : "If the customer still wants the items, keep the order open and contact them first."}
      </ConfirmDialog>

      {state.success ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-[var(--radius-card)] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm leading-relaxed text-emerald-300"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
