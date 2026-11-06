"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  setDeliveryQuoteAction,
  type OrderActionState,
} from "@/lib/admin/order-actions";
import { toast } from "@/lib/toast";
import { buttonClasses } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-field";
import { formatPriceCents } from "@/lib/utils";

const initialState: OrderActionState = {};

export function DeliveryQuoteForm({
  orderId,
  subtotalCents,
  deliveryFeeCents,
  totalCents,
  quoteRequired,
}: {
  orderId: string;
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  quoteRequired: boolean;
}) {
  const [state, formAction, pending] = useActionState(setDeliveryQuoteAction, initialState);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (state.success) toast.success(state.success);
  }, [state.success]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

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

      <dl className="space-y-2 rounded-[var(--radius-card)] border border-line bg-ink px-4 py-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-bone-dim">Items</dt>
          <dd className="font-mono">{formatPriceCents(subtotalCents)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-bone-dim">Current delivery</dt>
          <dd className="font-mono">
            {quoteRequired ? "To be confirmed" : formatPriceCents(deliveryFeeCents)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-line pt-2">
          <dt className="text-bone">Current total</dt>
          <dd className="font-mono">{formatPriceCents(totalCents)}</dd>
        </div>
      </dl>

      <TextField
        label="Agreed delivery fee (R)"
        name="fee"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        defaultValue={deliveryFeeCents > 0 ? (deliveryFeeCents / 100).toFixed(2) : ""}
        placeholder="0.00"
        hint="Enter the fee you agreed with the customer. The order total updates to items plus this fee."
      />

      <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border border-line px-3 py-2.5 has-[:checked]:border-accent/50 has-[:checked]:bg-accent/5">
        <input
          type="checkbox"
          name="confirmed"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="mt-1 h-4 w-4 accent-[var(--accent)]"
        />
        <span className="text-sm leading-relaxed text-bone">
          I have confirmed this delivery fee with the customer.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending || !confirmed}
        className={buttonClasses("primary", "w-full")}
      >
        {pending ? "Updating…" : "Record fee and update total"}
      </button>
    </form>
  );
}
