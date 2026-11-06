import Image from "next/image";
import { Check } from "lucide-react";
import { ORDER_STATUS_LABELS, formatOrderDate, orderSizeLabel } from "@/lib/orders/format";
import type { TrackedOrder } from "@/lib/orders/types";
import { mediaUrl } from "@/lib/supabase/media";
import { formatPriceCents } from "@/lib/utils";
import { LifterMark } from "@/components/brand/lifter-mark";

export function OrderItemsCard({ order }: { order: TrackedOrder }) {
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-ink-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="eyebrow text-bone">Your items</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      <ul className="divide-y divide-line px-5">
        {order.items.map((item, index) => {
          const image = mediaUrl(item.image_path);
          return (
            <li key={`${item.product_name}-${index}`} className="flex gap-4 py-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised">
                {image ? (
                  <Image
                    src={image}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center">
                    <LifterMark className="h-8 opacity-30" />
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.04em] text-bone">
                    {item.product_name}
                  </p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-bone-dim">
                    {item.colour_name} · {orderSizeLabel(item.size)} · Qty {item.quantity}
                  </p>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                    {formatPriceCents(item.unit_price_cents)} each
                  </p>
                </div>
                <p className="shrink-0 font-mono text-xs text-bone">
                  {formatPriceCents(item.line_total_cents)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-line px-5 py-4">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="text-bone-dim">Subtotal</span>
          <span className="font-mono text-bone">{formatPriceCents(order.subtotal_cents)}</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-3 text-sm">
          <span className="text-bone-dim">Delivery</span>
          <span className="font-mono text-bone">
            {order.delivery_quote_required
              ? order.delivery_fee_cents > 0
                ? formatPriceCents(order.delivery_fee_cents)
                : "To be confirmed"
              : order.delivery_fee_cents === 0
                ? "Free"
                : formatPriceCents(order.delivery_fee_cents)}
          </span>
        </div>
        {order.delivery_quote_required && order.delivery_fee_cents === 0 ? (
          <p className="mt-2 text-caption leading-relaxed text-bone-dim">
            We will contact you to confirm the courier cost and options before dispatch.
          </p>
        ) : null}
        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-4">
          <span className="text-sm text-bone">Total</span>
          <span className="font-mono text-lg text-bone">{formatPriceCents(order.total_cents)}</span>
        </div>
      </div>
    </section>
  );
}

export function OrderTimelineCard({ order }: { order: TrackedOrder }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-5">
      <h2 className="eyebrow text-bone">Progress</h2>
      <ol className="mt-4 space-y-4">
        {order.events.map((event, index) => {
          const latest = index === order.events.length - 1;
          return (
            <li key={`${event.status}-${event.created_at}`} className="flex gap-3">
              <span
                className={
                  latest
                    ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink"
                    : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line text-bone-dim"
                }
              >
                {latest ? (
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone">
                  {ORDER_STATUS_LABELS[event.status]}
                </p>
                {event.note ? (
                  <p className="mt-1 text-xs leading-relaxed text-bone-dim">{event.note}</p>
                ) : null}
                <p className="mt-1 text-[11px] text-bone-dim/80">
                  {formatOrderDate(event.created_at, true)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-bone-dim">
        We will email you when your order is confirmed and again when it leaves us. Keep your order
        number for tracking.
      </p>
    </section>
  );
}
