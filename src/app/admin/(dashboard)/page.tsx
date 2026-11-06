import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDashboardData } from "@/lib/admin/queries";
import { formatOrderDate } from "@/lib/orders/format";
import { formatPriceCents } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { RealtimeRefresh } from "@/components/admin/realtime-refresh";
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

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard."
        description="Live orders, revenue and stock across the store."
        action={<RealtimeRefresh channelName="dashboard" />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders today"
          value={String(data.ordersToday)}
          hint="New orders since midnight, excluding cancelled."
          href="/admin/orders"
        />
        <StatCard
          label="Pending fulfilment"
          value={String(data.pendingOrders)}
          hint="Received, confirmed or packed and not yet on the way."
          href="/admin/orders?status=pending"
        />
        <StatCard
          label="Revenue · 30 days"
          value={formatPriceCents(data.revenue30)}
          hint={`${data.orders30} ${data.orders30 === 1 ? "order" : "orders"}, excluding cancelled.`}
        />
        <StatCard
          label="Low stock"
          value={String(data.lowStockCount)}
          hint={`${data.outOfStockCount} variants out of stock. ${data.activeProducts} active products, ${data.activeCollections} collections.`}
          href="/admin/inventory?level=low"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <AdminPanel
          title="Recent orders"
          className="xl:col-span-8"
          action={
            <Link href="/admin/orders" className={buttonClasses("secondary", "min-h-9 px-3 py-1.5")}>
              All orders
            </Link>
          }
        >
          {data.recentOrders.length === 0 ? (
            <AdminEmpty
              title="No orders yet."
              body="As soon as the first checkout lands it will appear here with its delivery details."
              action={
                <Link href="/admin/products" className={buttonClasses("secondary")}>
                  Manage products
                </Link>
              }
            />
          ) : (
            <>
              <ul className="divide-y divide-line sm:hidden">
                {data.recentOrders.map((order) => (
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
                          <span className="ml-2 text-xs text-bone-dim">{order.city}</span>
                        </span>
                        <span className="shrink-0 font-mono text-xs text-bone">
                          {formatPriceCents(order.total_cents)}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                        {formatOrderDate(order.created_at, true)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="hidden sm:block">
                <TableShell>
                  <thead>
                    <tr>
                      <Th>Order</Th>
                      <Th>Customer</Th>
                      <Th>Placed</Th>
                      <Th>Status</Th>
                      <Th className="text-right">Total</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr key={order.id} className="transition-colors hover:bg-bone/[0.03]">
                        <Td>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-mono text-xs text-bone hover:text-accent"
                          >
                            {order.order_number}
                          </Link>
                        </Td>
                        <Td>
                          <span className="text-bone">
                            {order.customer_first_name} {order.customer_last_name}
                          </span>
                          <span className="block text-xs text-bone-dim">{order.city}</span>
                        </Td>
                        <Td className="font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                          {formatOrderDate(order.created_at, true)}
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

        <AdminPanel
          title="Low stock"
          meta={
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
              {data.lowStockCount} flagged
            </span>
          }
          className="xl:col-span-4"
          action={
            <Link
              href="/admin/inventory?level=low"
              className="inline-flex min-h-9 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent hover:text-bone"
            >
              Manage <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          }
        >
          {data.lowStock.length === 0 ? (
            <AdminEmpty
              title="Stock levels are healthy."
              body="Nothing is below the low-stock threshold right now. Out-of-stock variants are hidden from the storefront."
            />
          ) : (
            <ul className="divide-y divide-line">
              {data.lowStock.map((variant) => (
                <li key={variant.variantId} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-bone">{variant.productName}</p>
                    <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                      {variant.colourName} · {variant.size === "ONE_SIZE" ? "One size" : variant.size} · {variant.sku}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-accent/40 bg-accent/10 px-2 py-1 font-mono text-[10px] text-accent">
                    {variant.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </>
  );
}
