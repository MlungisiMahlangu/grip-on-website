import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Pause, Pencil, Play, Plus, Search } from "lucide-react";
import { getAdminDiscounts } from "@/lib/admin/operations-queries";
import { toggleDiscountActiveAction } from "@/lib/admin/discount-actions";
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
import {
  DiscountStatusBadge,
  discountValueLabel,
} from "@/components/admin/discount-status";

export const metadata: Metadata = { title: "Discounts" };

type SearchParams = Promise<{ q?: string; page?: string; saved?: string }>;

function pageHref(query: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const value = params.toString();
  return value ? `/admin/discounts?${value}` : "/admin/discounts";
}

function Redemptions({ used, max }: { used: number; max: number | null }) {
  return (
    <span className="font-mono text-[11px] text-bone-dim">
      {used}
      {max === null ? " used · unlimited" : ` / ${max} used`}
    </span>
  );
}

export default async function AdminDiscountsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const data = await getAdminDiscounts({ query: params.q, page });

  return (
    <>
      <AdminPageHeader
        eyebrow="Marketing"
        title="Discounts."
        description="Codes customers can apply at checkout. Every code is validated and priced on the server."
        action={
          <Link href="/admin/discounts/new" className={buttonClasses("primary")}>
            <Plus aria-hidden="true" />
            New discount
          </Link>
        }
      />

      {params.saved === "1" ? (
        <p
          role="status"
          className="mb-5 flex items-center gap-2 rounded-[var(--radius-card)] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Discount saved.
        </p>
      ) : null}

      <form method="get" className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <label htmlFor="q" className="eyebrow text-bone-dim">
            Search codes
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Code or description"
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
            <Link href="/admin/discounts" className={buttonClasses("secondary")}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <AdminPanel
        title="Discount codes"
        meta={
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
            {data.count} {data.count === 1 ? "code" : "codes"}
          </span>
        }
      >
        {data.discounts.length === 0 ? (
          <AdminEmpty
            title={params.q ? "No codes match that search." : "No discount codes yet."}
            body={
              params.q
                ? "Try a different code or description."
                : "Create a percentage or fixed-amount code, optionally with a minimum spend, window or redemption cap."
            }
            action={
              <Link href="/admin/discounts/new" className={buttonClasses("primary")}>
                New discount
              </Link>
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-line md:hidden">
              {data.discounts.map((discount) => (
                <li key={discount.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/discounts/${discount.id}`}
                        className="font-mono text-sm text-bone hover:text-accent"
                      >
                        {discount.code}
                      </Link>
                      <p className="mt-0.5 text-xs text-bone-dim">
                        {discountValueLabel(discount)} off
                        {discount.min_subtotal_cents > 0
                          ? ` · min ${formatPriceCents(discount.min_subtotal_cents)}`
                          : ""}
                      </p>
                    </div>
                    <DiscountStatusBadge discount={discount} />
                  </div>
                  {discount.description ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-bone-dim">
                      {discount.description}
                    </p>
                  ) : null}
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <Redemptions used={discount.times_redeemed} max={discount.max_redemptions} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                      {discount.ends_at
                        ? `Ends ${formatOrderDate(discount.ends_at)}`
                        : "No end date"}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    <Link
                      href={`/admin/discounts/${discount.id}`}
                      className={buttonClasses("secondary", "min-h-11 flex-1")}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                    <form action={toggleDiscountActiveAction}>
                      <input type="hidden" name="id" value={discount.id} />
                      <input type="hidden" name="value" value={String(!discount.is_active)} />
                      <button
                        type="submit"
                        className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] border border-line text-bone-dim transition-colors hover:border-bone hover:text-bone"
                        aria-label={discount.is_active ? "Pause code" : "Activate code"}
                        title={discount.is_active ? "Pause code" : "Activate code"}
                      >
                        {discount.is_active ? (
                          <Pause className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Play className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden md:block">
              <TableShell>
                <thead>
                  <tr>
                    <Th>Code</Th>
                    <Th>Value</Th>
                    <Th>Rules</Th>
                    <Th>Used</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.discounts.map((discount) => (
                    <tr key={discount.id} className="transition-colors hover:bg-bone/[0.03]">
                      <Td>
                        <Link
                          href={`/admin/discounts/${discount.id}`}
                          className="font-mono text-xs text-bone hover:text-accent"
                        >
                          {discount.code}
                        </Link>
                        {discount.description ? (
                          <span className="block max-w-[16rem] truncate text-xs text-bone-dim">
                            {discount.description}
                          </span>
                        ) : null}
                      </Td>
                      <Td className="whitespace-nowrap font-mono text-xs">
                        {discountValueLabel(discount)}
                      </Td>
                      <Td className="text-xs text-bone-dim">
                        {discount.min_subtotal_cents > 0
                          ? `Min ${formatPriceCents(discount.min_subtotal_cents)}`
                          : "No minimum"}
                        <span className="block font-mono text-[10px] uppercase tracking-[0.1em]">
                          {discount.ends_at
                            ? `Ends ${formatOrderDate(discount.ends_at)}`
                            : "No end date"}
                        </span>
                      </Td>
                      <Td>
                        <Redemptions used={discount.times_redeemed} max={discount.max_redemptions} />
                      </Td>
                      <Td>
                        <DiscountStatusBadge discount={discount} />
                      </Td>
                      <Td>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/discounts/${discount.id}`}
                            className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] border border-line text-bone-dim transition-colors hover:border-bone hover:text-bone"
                            aria-label={`Edit ${discount.code}`}
                            title={`Edit ${discount.code}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Link>
                          <form action={toggleDiscountActiveAction}>
                            <input type="hidden" name="id" value={discount.id} />
                            <input type="hidden" name="value" value={String(!discount.is_active)} />
                            <button
                              type="submit"
                              className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] border border-line text-bone-dim transition-colors hover:border-bone hover:text-bone"
                              aria-label={discount.is_active ? "Pause code" : "Activate code"}
                              title={discount.is_active ? "Pause code" : "Activate code"}
                            >
                              {discount.is_active ? (
                                <Pause className="h-4 w-4" aria-hidden="true" />
                              ) : (
                                <Play className="h-4 w-4" aria-hidden="true" />
                              )}
                            </button>
                          </form>
                        </div>
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
        <nav className="mt-5 flex items-center justify-between gap-3" aria-label="Discount pages">
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
