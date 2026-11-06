"use client";

import { useActionState } from "react";
import { Loader2, Search } from "lucide-react";
import { trackOrderAction, type TrackOrderState } from "@/lib/checkout/actions";
import { ORDER_STATUS_LABELS, formatOrderDate } from "@/lib/orders/format";
import { formatPriceCents } from "@/lib/utils";
import { OrderItemsCard, OrderTimelineCard } from "@/components/orders/order-details";
import { buttonClasses } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-field";

const initialState: TrackOrderState = { status: "idle" };

export function TrackOrderForm({ defaultOrder }: { defaultOrder?: string }) {
  const [state, formAction, pending] = useActionState(trackOrderAction, initialState);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <form action={formAction} className="lg:col-span-5">
        <div className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-5">
          <h2 className="eyebrow text-bone">Find your order</h2>
          <p className="mt-3 text-sm leading-relaxed text-bone-dim">
            Use the order number from your confirmation email and the same email or phone number you
            checked out with.
          </p>

          <div className="mt-5 flex flex-col gap-4">
            <TextField
              label="Order number"
              name="orderNumber"
              defaultValue={state.orderNumber ?? defaultOrder}
              placeholder="GO-2026-0000"
              autoComplete="off"
              spellCheck={false}
              required
            />
            <TextField
              label="Email or phone"
              name="contact"
              defaultValue={state.contact}
              autoComplete="email"
              required
            />
            <button type="submit" disabled={pending} className={buttonClasses("primary", "w-full")}>
              {pending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Checking
                </>
              ) : (
                <>
                  <Search />
                  Find my order
                </>
              )}
            </button>
          </div>

          {state.message ? (
            <p
              role="alert"
              className="mt-4 rounded-[var(--radius-card)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200"
            >
              {state.message}
            </p>
          ) : null}
        </div>
      </form>

      <div className="lg:col-span-7" aria-live="polite">
        {state.status === "found" && state.order ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-[var(--radius-card)] border border-line bg-ink p-5">
              <p className="eyebrow text-accent">{ORDER_STATUS_LABELS[state.order.status]}</p>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-sm text-bone">{state.order.order_number}</p>
                  <p className="mt-1 text-sm text-bone-dim">
                    Placed {formatOrderDate(state.order.created_at)} · {state.order.city},{" "}
                    {state.order.province}
                  </p>
                </div>
                <p className="font-mono text-lg text-bone">
                  {formatPriceCents(state.order.total_cents)}
                </p>
              </div>
              <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-bone-dim">
                Cash on delivery. Have {formatPriceCents(state.order.total_cents)} ready for the
                courier.
              </p>
            </div>

            <OrderItemsCard order={state.order} />
            <OrderTimelineCard order={state.order} />
          </div>
        ) : state.status === "notfound" || state.status === "error" ? (
          <div className="flex h-full min-h-60 flex-col items-center justify-center rounded-[var(--radius-card)] border border-line bg-ink-soft px-6 py-12 text-center">
            <Search className="h-8 w-8 text-bone-dim" strokeWidth={1.5} />
            <p className="mt-4 text-sm leading-relaxed text-bone-dim">
              Nothing yet. Check the order number and the contact you used at checkout.
            </p>
          </div>
        ) : (
          <div className="flex h-full min-h-60 flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-line px-6 py-12 text-center">
            <p className="max-w-xs text-sm leading-relaxed text-bone-dim">
              Your order details will appear here once we find it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
