import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { getAdminCustomers } from "@/lib/admin/operations-queries";
import { formatOrderDate } from "@/lib/orders/format";
import { formatPriceCents, cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { controlClasses } from "@/components/ui/form-field";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  TableShell,
  Td,
  Th,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Customers" };

type SearchParams = Promise<{ q?: string; page?: string }>;

function pageHref(query: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const value = params.toString();
  return value ? `/admin/customers?${value}` : "/admin/customers";
}

function customerName(first: string, last: string) {
  return [first, last].filter(Boolean).join(" ") || "Customer";
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const data = await getAdminCustomers({ query: params.q, page });

  return (
    <>
      <AdminPageHeader
        eyebrow="People"
        title="Customers."
        description="Everyone who has checked out, built from their orders. Guest checkouts are included."
      />

      <form method="get" className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <label htmlFor="q" className="eyebrow text-bone-dim">
            Search customers
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Name, email or city"
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
            <Link href="/admin/customers" className={buttonClasses("secondary")}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <AdminPanel
        title="Customer list"
        meta={
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
            {data.count} {data.count === 1 ? "customer" : "customers"}
          </span>
        }
      >
        {data.customers.length === 0 ? (
          <AdminEmpty
            title={params.q ? "No customers match that search." : "No customers yet."}
            body={
              params.q
                ? "Try a different name, email or city."
                : "Customers appear here after their first order, including guest checkouts."
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-line md:hidden">
              {data.customers.map((customer) => (
                <li key={customer.email}>
                  <Link
                    href={`/admin/customers/${encodeURIComponent(customer.email)}`}
                    className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-bone/[0.03]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-sm text-bone">
                        {customerName(customer.first_name, customer.last_name)}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-bone">
                        {formatPriceCents(customer.total_spent_cents)}
                      </span>
                    </div>
                    <span className="truncate text-xs text-bone-dim">{customer.email}</span>
                    <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                      <span>
                        {customer.city}, {customer.province}
                      </span>
                      <span>
                        {customer.order_count} {customer.order_count === 1 ? "order" : "orders"}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                      Last order {formatOrderDate(customer.last_order_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden md:block">
              <TableShell>
                <thead>
                  <tr>
                    <Th>Customer</Th>
                    <Th>Location</Th>
                    <Th>Orders</Th>
                    <Th>Last order</Th>
                    <Th className="text-right">Spent</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.customers.map((customer) => (
                    <tr key={customer.email} className="transition-colors hover:bg-bone/[0.03]">
                      <Td>
                        <Link
                          href={`/admin/customers/${encodeURIComponent(customer.email)}`}
                          className="block text-sm text-bone hover:text-accent"
                        >
                          {customerName(customer.first_name, customer.last_name)}
                        </Link>
                        <span className="block truncate text-xs text-bone-dim">
                          {customer.email}
                        </span>
                      </Td>
                      <Td className="text-xs text-bone-dim">
                        {customer.city}
                        <span className="block font-mono text-[10px] uppercase tracking-[0.1em]">
                          {customer.province}
                        </span>
                      </Td>
                      <Td className="font-mono text-xs">{customer.order_count}</Td>
                      <Td className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                        {formatOrderDate(customer.last_order_at)}
                      </Td>
                      <Td className="text-right font-mono text-xs">
                        {formatPriceCents(customer.total_spent_cents)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            </div>
          </>
        )}
      </AdminPanel>

      {data.pageCount > 1 ? (
        <nav className="mt-5 flex items-center justify-between gap-3" aria-label="Customer pages">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">
            Page {data.page} of {data.pageCount}
          </p>
          <div className="flex gap-2">
            {data.page > 1 ? (
              <Link
                href={pageHref(params.q, data.page - 1)}
                className={buttonClasses("secondary", "min-h-10")}
              >
                Previous
              </Link>
            ) : null}
            {data.page < data.pageCount ? (
              <Link
                href={pageHref(params.q, data.page + 1)}
                className={buttonClasses("secondary", "min-h-10")}
              >
                Next
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}
