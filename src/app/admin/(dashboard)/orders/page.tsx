import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { getOrders, ORDER_STATUS_VALUES } from "@/lib/admin/queries";
import { ORDER_STATUS_LABELS, formatOrderDate } from "@/lib/orders/format";
import { formatPriceCents } from "@/lib/utils";
import type { OrderStatus } from "@/lib/supabase/types";
import { RealtimeRefresh } from "@/components/admin/realtime-refresh";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  StatusBadge,
  TableShell,
  Td,
  Th,
} from "@/components/admin/ui";
import { buttonClasses } from "@/components/ui/button";
import { controlClasses } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

type SearchParams = Promise<{ status?: string; q?: string; page?: string }>;

function pageHref(params: { status?: string; q?: string }, page: number) {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.q) query.set("q", params.q);
  if (page > 1) query.set("page", String(page));
  const value = query.toString();
  return value ? `/admin/orders?${value}` : "/admin/orders";
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = ORDER_STATUS_VALUES.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : undefined;
  const page = Math.max(1, Number(params.page) || 1);
  const data = await getOrders({ status: status ?? "all", query: params.q, page });
  const total = Object.values(data.statusCounts).reduce((sum, count) => sum + count, 0);
  const filter = { status: status ?? "all", q: params.q };

  return (
    <>
      <AdminPageHeader
        eyebrow="Fulfilment"
        title="Orders."
        description="Every order, its delivery details and where it is in the packing flow."
        action={<RealtimeRefresh channelName="orders" />}
      />

      <form method="get" className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <div className="relative flex-1">
          <label htmlFor="q" className="eyebrow text-bone-dim">
            Search orders
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Number, name, email, phone or city"
            className={cn(controlClasses, "mt-1.5 pl-10")}
          />
          <Search
            className="pointer-events-none absolute bottom-3.5 left-3 h-4 w-4 text-bone-dim"
            aria-hidden="true"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={buttonClasses("primary")}>
            Search
          </button>
          {params.q ? (
            <Link href={pageHref({ status: status ?? "all" }, 1)} className={buttonClasses("secondary")}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Filter by status">
        <Link
          href={pageHref({ q: params.q }, 1)}
          aria-current={!status ? "true" : undefined}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-card)] border px-3 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
            !status
              ? "border-accent bg-accent text-accent-ink"
              : "border-line text-bone-dim hover:border-line-strong hover:text-bone",
          )}
        >
          All <span className="ml-1.5">{total}</span>
        </Link>
        {ORDER_STATUS_VALUES.map((value) => (
          <Link
            key={value}
            href={pageHref({ status: value, q: params.q }, 1)}
            aria-current={status === value ? "true" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-card)] border px-3 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
              status === value
                ? "border-accent bg-accent text-accent-ink"
                : "border-line text-bone-dim hover:border-line-strong hover:text-bone",
            )}
          >
            {ORDER_STATUS_LABELS[value]} <span className="ml-1.5">{data.statusCounts[value]}</span>
          </Link>
        ))}
      </div>

      <AdminPanel
        title="Order list"
        meta={
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
            {data.count} {data.count === 1 ? "order" : "orders"}
          </span>
        }
      >
        {data.orders.length === 0 ? (
          <AdminEmpty
            title={params.q ? "No orders match that search." : "No orders here yet."}
            body={
              params.q
                ? "Try a different order number, customer name, email or phone number."
                : "Orders appear here as soon as checkout completes. The list updates live when someone orders."
            }
            action={
              params.q ? (
                <Link href="/admin/orders" className={buttonClasses("secondary")}>
                  Clear filters
                </Link>
              ) : null
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-line md:hidden">
              {data.orders.map((order) => (
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
                      <span className="min-w-0 truncate text-sm text-bone">
                        {order.customer_first_name} {order.customer_last_name}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-bone">
                        {formatPriceCents(order.total_cents)}
                      </span>
                    </div>
                    <span className="truncate text-xs text-bone-dim">{order.customer_email}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                      {formatOrderDate(order.created_at)} · {order.province} · COD{" "}
                      {order.payment_status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="hidden md:block">
              <TableShell>
                <thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Customer</Th>
                    <Th>Placed</Th>
                    <Th>Status</Th>
                    <Th>Payment</Th>
                    <Th className="text-right">Total</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-bone/[0.03]">
                      <Td>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-xs text-bone hover:text-accent"
                        >
                          {order.order_number}
                        </Link>
                        <span className="block text-[11px] text-bone-dim">
                          {order.province}
                        </span>
                      </Td>
                      <Td>
                        <span className="block text-bone">
                          {order.customer_first_name} {order.customer_last_name}
                        </span>
                        <span className="block truncate text-xs text-bone-dim">{order.customer_email}</span>
                      </Td>
                      <Td className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                        {formatOrderDate(order.created_at)}
                      </Td>
                      <Td>
                        <StatusBadge status={order.status} />
                      </Td>
                      <Td className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone-dim">
                        COD · {order.payment_status}
                      </Td>
                      <Td className="text-right font-mono text-xs">{formatPriceCents(order.total_cents)}</Td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            </div>
          </>
        )}
      </AdminPanel>

      {data.pageCount > 1 ? (
        <nav className="mt-5 flex items-center justify-between gap-3" aria-label="Order pages">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">
            Page {data.page} of {data.pageCount}
          </p>
          <div className="flex gap-2">
            {data.page > 1 ? (
              <Link href={pageHref(filter, data.page - 1)} className={buttonClasses("secondary", "min-h-10")}>
                Previous
              </Link>
            ) : null}
            {data.page < data.pageCount ? (
              <Link href={pageHref(filter, data.page + 1)} className={buttonClasses("secondary", "min-h-10")}>
                Next
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}
