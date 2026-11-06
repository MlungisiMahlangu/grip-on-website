import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { getInventory } from "@/lib/admin/queries";
import { buttonClasses } from "@/components/ui/button";
import { controlClasses } from "@/components/ui/form-field";
import { StockForm } from "@/components/admin/stock-form";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  TableShell,
  Td,
  Th,
} from "@/components/admin/ui";
import { LifterMark } from "@/components/brand/lifter-mark";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Inventory" };

const PAGE_SIZE = 50;

type SearchParams = Promise<{ q?: string; level?: string; page?: string }>;

function pageHref(params: { q?: string; level?: "all" | "low" | "out" }, page: number) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.level && params.level !== "all") query.set("level", params.level);
  if (page > 1) query.set("page", String(page));
  const value = query.toString();
  return value ? `/admin/inventory?${value}` : "/admin/inventory";
}

function levelOf(stock: number) {
  if (stock === 0) return "out";
  if (stock <= 5) return "low";
  return "ok";
}

export default async function AdminInventoryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const level = params.level === "low" || params.level === "out" ? params.level : "all";
  const page = Math.max(1, Number(params.page) || 1);
  const data = await getInventory({ query: params.q, level });
  const pageCount = Math.max(1, Math.ceil(data.rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = data.rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <AdminPageHeader
        eyebrow="Stock"
        title="Inventory."
        description="Every active variant. Zero-stock sizes are hidden on the storefront; low stock is flagged at 5 or fewer."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        {[
          { label: "Active variants", value: data.total },
          { label: "Units on hand", value: data.stock },
          { label: "Low stock", value: data.low },
          { label: "Out of stock", value: data.out },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[var(--radius-card)] border border-line bg-ink-soft px-4 py-3">
            <p className="eyebrow text-bone-dim">{stat.label}</p>
            <p className="mt-1 font-mono text-2xl text-bone">{stat.value}</p>
          </div>
        ))}
      </div>

      <form method="get" className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        {level !== "all" ? <input type="hidden" name="level" value={level} /> : null}
        <div className="relative flex-1">
          <label htmlFor="q" className="eyebrow text-bone-dim">
            Search inventory
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Product, colour, size or SKU"
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
            <Link href={pageHref({ level }, 1)} className={buttonClasses("secondary")}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mb-4 flex gap-1.5" role="group" aria-label="Filter by stock level">
        {(
          [
            { id: "all", label: "All", count: data.total },
            { id: "low", label: "Low", count: data.low },
            { id: "out", label: "Out", count: data.out },
          ] as const
        ).map((tab) => (
          <Link
            key={tab.id}
            href={pageHref({ q: params.q, level: tab.id }, 1)}
            aria-current={level === tab.id ? "true" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-[var(--radius-card)] border px-3 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
              level === tab.id
                ? "border-accent bg-accent text-accent-ink"
                : "border-line text-bone-dim hover:border-line-strong hover:text-bone",
            )}
          >
            {tab.label} <span className="ml-1.5">{tab.count}</span>
          </Link>
        ))}
      </div>

      <AdminPanel
        title="Variants"
        meta={
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
            {data.rows.length} {data.rows.length === 1 ? "variant" : "variants"}
          </span>
        }
      >
        {rows.length === 0 ? (
          <AdminEmpty
            title={params.q ? "No variants match that search." : "Nothing at this stock level."}
            body={
              params.q
                ? "Try a product, colour, size or SKU."
                : "All variants are above the low-stock threshold. Switch back to All to see everything."
            }
            action={
              <Link href="/admin/inventory" className={buttonClasses("secondary")}>
                Show all stock
              </Link>
            }
          />
        ) : (
          <>
            <div className="hidden md:block">
              <TableShell>
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th>Colour</Th>
                    <Th>Size</Th>
                    <Th>SKU</Th>
                    <Th>Stock</Th>
                    <Th>Update</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.variant.id} className="transition-colors hover:bg-bone/[0.03]">
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised">
                            {row.image ? (
                              <Image src={row.image} alt="" fill sizes="36px" className="object-cover" />
                            ) : (
                              <span className="flex h-full items-center justify-center">
                                <LifterMark className="h-4 opacity-30" />
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/admin/products/${row.variant.product_id}`}
                            className="text-sm text-bone hover:text-accent"
                          >
                            {row.productName}
                          </Link>
                        </div>
                      </Td>
                      <Td>
                        <span className="flex items-center gap-2 text-xs text-bone-dim">
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 rounded-full border border-line-strong"
                            style={{ backgroundColor: row.colourHex }}
                          />
                          {row.colourName}
                        </span>
                      </Td>
                      <Td className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone-dim">
                        {row.variant.size === "ONE_SIZE" ? "One size" : row.variant.size}
                      </Td>
                      <Td className="font-mono text-[10px] tracking-[0.06em] text-bone-dim">
                        {row.variant.sku}
                      </Td>
                      <Td>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-1 font-mono text-[10px]",
                            levelOf(row.variant.stock_quantity) === "out"
                              ? "border-red-400/30 bg-red-400/10 text-red-300"
                              : levelOf(row.variant.stock_quantity) === "low"
                                ? "border-accent/40 bg-accent/10 text-accent"
                                : "border-line text-bone",
                          )}
                        >
                          {row.variant.stock_quantity}
                        </span>
                      </Td>
                      <Td>
                        <StockForm
                          variantId={row.variant.id}
                          stock={row.variant.stock_quantity}
                          label={`${row.productName} ${row.colourName} ${row.variant.size}`}
                        />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            </div>

            <ul className="divide-y divide-line md:hidden">
              {rows.map((row) => (
                <li key={row.variant.id} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised">
                      {row.image ? (
                        <Image src={row.image} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center">
                          <LifterMark className="h-5 opacity-30" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-bone">{row.productName}</p>
                      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                        {row.colourName} · {row.variant.size === "ONE_SIZE" ? "One size" : row.variant.size}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[9px] tracking-[0.06em] text-bone-dim">
                        {row.variant.sku}
                      </p>
                      <div className="mt-2">
                        <StockForm
                          variantId={row.variant.id}
                          stock={row.variant.stock_quantity}
                          label={`${row.productName} ${row.colourName} ${row.variant.size}`}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </AdminPanel>

      {pageCount > 1 ? (
        <nav className="mt-5 flex items-center justify-between gap-3" aria-label="Inventory pages">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">
            Page {currentPage} of {pageCount}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 ? (
              <Link
                href={pageHref({ q: params.q, level }, currentPage - 1)}
                className={buttonClasses("secondary", "min-h-10")}
              >
                Previous
              </Link>
            ) : null}
            {currentPage < pageCount ? (
              <Link
                href={pageHref({ q: params.q, level }, currentPage + 1)}
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
