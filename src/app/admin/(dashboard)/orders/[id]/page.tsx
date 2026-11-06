import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { getOrderDetail } from "@/lib/admin/queries";
import { ORDER_STATUS_LABELS, formatOrderDate, orderSizeLabel } from "@/lib/orders/format";
import { mediaUrl } from "@/lib/supabase/media";
import { formatPriceCents } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/ui/confirm-dialog";
import { RealtimeRefresh } from "@/components/admin/realtime-refresh";
import { MarkOrderViewed } from "@/components/admin/mark-order-viewed";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { deleteOrderAction } from "@/lib/admin/order-actions";
import { DeliveryQuoteForm } from "@/components/admin/delivery-quote-form";
import {
  AdminPageHeader,
  AdminPanel,
  DeliveryQuoteBadge,
  StatusBadge,
} from "@/components/admin/ui";
import { LifterMark } from "@/components/brand/lifter-mark";

export const metadata: Metadata = { title: "Order detail" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOrderDetail(id);
  if (!data) notFound();

  const { order, items, events } = data;
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const name = `${order.customer_first_name} ${order.customer_last_name}`;
  const address = [
    order.address_line1,
    order.address_line2,
    order.suburb,
    order.city,
    order.province,
    order.postal_code,
  ].filter(Boolean);

  return (
    <>
      <MarkOrderViewed orderId={order.id} />

      <div className="mb-5">
        <Link
          href="/admin/orders"
          className="inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:text-bone"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All orders
        </Link>
      </div>

      <AdminPageHeader
        eyebrow={`Placed ${formatOrderDate(order.created_at, true)}`}
        title={`${order.order_number}.`}
        description={`${name} · ${order.city}, ${order.province} · ${order.user_id ? "Customer account" : "Guest checkout"}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {order.delivery_quote_required ? <DeliveryQuoteBadge /> : null}
            <StatusBadge status={order.status} />
            <RealtimeRefresh channelName={`order-${order.id}`} />
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <AdminPanel
            title="Items"
            meta={
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            }
          >
            <ul className="divide-y divide-line px-4 sm:px-5">
              {items.map((item) => {
                const image = mediaUrl(item.image_path);
                return (
                  <li key={item.id} className="flex gap-4 py-4">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised">
                      {image ? (
                        <Image
                          src={image}
                          alt=""
                          aria-hidden="true"
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center">
                          <LifterMark className="h-7 opacity-30" />
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
                      <p className="shrink-0 font-mono text-xs">{formatPriceCents(item.line_total_cents)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <dl className="space-y-2 border-t border-line px-4 py-4 text-sm sm:px-5">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-bone-dim">Subtotal</dt>
                <dd className="font-mono">{formatPriceCents(order.subtotal_cents)}</dd>
              </div>
              {order.discount_cents > 0 ? (
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-bone-dim">
                    Discount{order.discount_code ? ` · ${order.discount_code}` : ""}
                  </dt>
                  <dd className="font-mono text-emerald-300">
                    −{formatPriceCents(order.discount_cents)}
                  </dd>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-bone-dim">Delivery</dt>
                <dd className="font-mono">
                  {order.delivery_quote_required
                    ? "To be confirmed"
                    : order.delivery_fee_cents === 0
                      ? "Free"
                      : formatPriceCents(order.delivery_fee_cents)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
                <dt className="text-bone">Total</dt>
                <dd className="font-mono text-lg">{formatPriceCents(order.total_cents)}</dd>
              </div>
            </dl>
          </AdminPanel>

          <AdminPanel title="Deliver to">
            <div className="grid gap-5 px-4 py-5 sm:grid-cols-2 sm:px-5">
              <div>
                <p className="text-sm font-medium text-bone">{name}</p>
                <a
                  href={`tel:${order.customer_phone}`}
                  className="mt-2 flex min-h-11 items-center gap-2 text-sm text-bone-dim transition-colors hover:text-bone"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {order.customer_phone}
                </a>
                <a
                  href={`mailto:${order.customer_email}`}
                  className="flex min-h-11 items-center gap-2 break-all text-sm text-bone-dim transition-colors hover:text-bone"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {order.customer_email}
                </a>
              </div>
              <div>
                <p className="flex items-start gap-2 text-sm leading-relaxed text-bone-dim">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">
                  Delivery area ·{" "}
                  {order.delivery_area === "johannesburg"
                    ? "Johannesburg (free)"
                    : "Outside Johannesburg"}
                </p>
                {order.delivery_notes ? (
                  <div className="mt-4 rounded-[var(--radius-card)] border border-line bg-ink px-3 py-2.5">
                    <p className="eyebrow text-bone-dim">Delivery notes</p>
                    <p className="mt-1 text-sm leading-relaxed text-bone">{order.delivery_notes}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title="Timeline">
            {events.length === 0 ? (
              <p className="px-4 py-5 text-sm text-bone-dim">No timeline entries yet.</p>
            ) : (
              <ol className="space-y-4 px-4 py-5 sm:px-5">
                {events.map((event, index) => {
                  const latest = index === events.length - 1;
                  return (
                    <li key={event.id} className="flex gap-3">
                      <span
                        className={
                          latest
                            ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink"
                            : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line text-bone-dim"
                        }
                      >
                        {latest ? (
                          <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
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
            )}
          </AdminPanel>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <AdminPanel title="Update status">
            <div className="p-4 sm:p-5">
              <OrderStatusForm orderId={order.id} status={order.status} />
            </div>
          </AdminPanel>

          {order.delivery_area === "outside" ? (
            <AdminPanel
              title="Delivery quote"
              meta={
                order.delivery_quote_required ? <DeliveryQuoteBadge /> : undefined
              }
            >
              <div className="p-4 sm:p-5">
                <p className="mb-4 text-xs leading-relaxed text-bone-dim">
                  This order is outside Johannesburg. Agree the courier cost with the customer,
                  then record it here. The order total updates automatically.
                </p>
                <DeliveryQuoteForm
                  orderId={order.id}
                  subtotalCents={order.subtotal_cents}
                  deliveryFeeCents={order.delivery_fee_cents}
                  totalCents={order.total_cents}
                  quoteRequired={order.delivery_quote_required}
                />
              </div>
            </AdminPanel>
          ) : null}

          <AdminPanel title="Payment">
            <dl className="space-y-3 px-4 py-5 text-sm sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-bone-dim">Method</dt>
                <dd className="font-mono text-[10px] uppercase tracking-[0.14em]">Cash on delivery</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-bone-dim">Payment status</dt>
                <dd className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                  {order.payment_status}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                <dt className="text-bone">Collect</dt>
                <dd className="font-mono text-lg">{formatPriceCents(order.total_cents)}</dd>
              </div>
            </dl>
          </AdminPanel>

          <AdminPanel title="Storefront links">
            <div className="flex flex-col gap-2 px-4 py-4 sm:px-5">
              <Link
                href={`/order/${order.order_number}`}
                className={buttonClasses("secondary", "w-full justify-start")}
              >
                Customer confirmation
              </Link>
              <Link
                href={`/track-order?order=${order.order_number}`}
                className={buttonClasses("secondary", "w-full justify-start")}
              >
                Track order
              </Link>
            </div>
            <p className="border-t border-line px-4 py-3 text-[11px] leading-relaxed text-bone-dim sm:px-5">
              Confirmation pages stay protected by the customer&apos;s order access cookie. These links
              open the public tracking flow.
            </p>
          </AdminPanel>
        </div>
      </div>

      {order.status === "cancelled" ? (
        <div className="mt-8 rounded-[var(--radius-card)] border border-red-400/25 bg-red-400/[0.04] p-4 sm:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-red-300">
            Delete cancelled order
          </p>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-bone-dim">
            Removes this cancelled order and its timeline from the admin permanently. Keep it if you
            need the record for reporting.
          </p>
          <form action={deleteOrderAction} className="mt-4">
            <input type="hidden" name="id" value={order.id} />
            <ConfirmSubmit
              title={`Delete order ${order.order_number}?`}
              description="The order, its items and its timeline will be removed permanently. This cannot be undone."
              confirmLabel="Delete order"
              className={buttonClasses("secondary", "border-red-400/40 text-red-300")}
            >
              <Trash2 aria-hidden="true" />
              Delete order
            </ConfirmSubmit>
          </form>
        </div>
      ) : null}
    </>
  );
}
