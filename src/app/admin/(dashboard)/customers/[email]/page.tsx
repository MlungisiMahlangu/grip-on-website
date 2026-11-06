import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { getAdminCustomer } from "@/lib/admin/operations-queries";
import { formatOrderDate } from "@/lib/orders/format";
import { formatPriceCents } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  StatCard,
  StatusBadge,
  TableShell,
  Td,
  Th,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Customer" };

export default async function AdminCustomerPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const { email } = await params;
  const data = await getAdminCustomer(decodeURIComponent(email));
  if (!data) notFound();

  const { summary, orders } = data;
  const name = [summary.first_name, summary.last_name].filter(Boolean).join(" ") || "Customer";
  const latest = orders[0];
  const average =
    summary.order_count > 0 ? Math.round(Number(summary.total_spent_cents) / summary.order_count) : 0;

  return (
    <>
      <Link
        href="/admin/customers"
        className="mb-5 inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:text-bone"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All customers
      </Link>

      <AdminPageHeader
        eyebrow="Customer"
        title={`${name}.`}
        description={`${summary.email} · ${summary.city}, ${summary.province}`}
        action={
          <a href={`mailto:${summary.email}`} className={buttonClasses("secondary")}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            Email
          </a>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Orders"
          value={String(summary.order_count)}
          hint={`First order ${formatOrderDate(summary.first_order_at)}.`}
        />
        <StatCard
          label="Spent"
          value={formatPriceCents(Number(summary.total_spent_cents))}
          hint="Excludes cancelled orders."
        />
        <StatCard
          label="Average order"
          value={formatPriceCents(average)}
          hint={`Saved ${formatPriceCents(Number(summary.discount_total_cents))} with codes.`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <AdminPanel
          title="Orders"
          meta={
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          }
          className="xl:col-span-8"
        >
          {orders.length === 0 ? (
            <AdminEmpty title="No orders." body="This customer has no orders on record." />
          ) : (
            <>
              <ul className="divide-y divide-line md:hidden">
                {orders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-bone/[0.03]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-xs text-bone">{order.order_number}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                          {formatOrderDate(order.created_at)}
                        </span>
                        <span className="font-mono text-xs text-bone">
                          {formatPriceCents(order.total_cents)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="hidden md:block">
                <TableShell>
                  <thead>
                    <tr>
                      <Th>Order</Th>
                      <Th>Placed</Th>
                      <Th>Status</Th>
                      <Th className="text-right">Total</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="transition-colors hover:bg-bone/[0.03]">
                        <Td>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-mono text-xs text-bone hover:text-accent"
                          >
                            {order.order_number}
                          </Link>
                          {order.discount_code ? (
                            <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                              {order.discount_code}
                            </span>
                          ) : null}
                        </Td>
                        <Td className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                          {formatOrderDate(order.created_at)}
                        </Td>
                        <Td>
                          <StatusBadge status={order.status} />
                        </Td>
                        <Td className="text-right font-mono text-xs">
                          {formatPriceCents(order.total_cents)}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </TableShell>
              </div>
            </>
          )}
        </AdminPanel>

        <div className="space-y-6 xl:col-span-4">
          <AdminPanel title="Contact">
            <div className="space-y-2 px-4 py-5 sm:px-5">
              <a
                href={`mailto:${summary.email}`}
                className="flex min-h-11 items-center gap-2 break-all text-sm text-bone-dim transition-colors hover:text-bone"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                {summary.email}
              </a>
              {summary.phone ? (
                <a
                  href={`tel:${summary.phone}`}
                  className="flex min-h-11 items-center gap-2 text-sm text-bone-dim transition-colors hover:text-bone"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {summary.phone}
                </a>
              ) : null}
              <p className="flex min-h-11 items-center gap-2 text-sm text-bone-dim">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {summary.city}, {summary.province}
              </p>
            </div>
          </AdminPanel>

          {latest ? (
            <AdminPanel title="Latest delivery">
              <div className="px-4 py-5 text-sm leading-relaxed text-bone sm:px-5">
                <p>
                  {latest.address_line1}
                  {latest.address_line2 ? `, ${latest.address_line2}` : ""}
                </p>
                <p className="text-bone-dim">
                  {latest.suburb}, {latest.city}, {latest.province}, {latest.postal_code}
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-bone-dim">
                  {latest.order_number} · {formatOrderDate(latest.created_at)}
                </p>
              </div>
            </AdminPanel>
          ) : null}
        </div>
      </div>
    </>
  );
}
