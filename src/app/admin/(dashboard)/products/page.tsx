import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Archive, ArchiveRestore, Pencil, Plus, Star, StarOff } from "lucide-react";
import { getAdminProducts } from "@/lib/admin/queries";
import { toggleProductFlagAction } from "@/lib/admin/product-actions";
import { PRODUCT_TYPE_LABELS } from "@/lib/admin/schemas";
import { formatPriceCents } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  TableShell,
  Td,
  Th,
} from "@/components/admin/ui";
import { LifterMark } from "@/components/brand/lifter-mark";
import { FlashToast } from "@/components/admin/flash-toast";

export const metadata: Metadata = { title: "Products" };

function ToggleButton({
  productId,
  flag,
  value,
  label,
  icon: Icon,
}: {
  productId: string;
  flag: "is_active" | "is_featured";
  value: boolean;
  label: string;
  icon: typeof Star;
}) {
  return (
    <form action={toggleProductFlagAction}>
      <input type="hidden" name="id" value={productId} />
      <input type="hidden" name="flag" value={flag} />
      <input type="hidden" name="value" value={String(value)} />
      <button
        type="submit"
        className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] border border-line text-bone-dim transition-colors hover:border-bone hover:text-bone"
        aria-label={label}
        title={label}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const [products, params] = await Promise.all([getAdminProducts(), searchParams]);

  return (
    <>
      {params.deleted === "1" ? <FlashToast message="Product deleted." /> : null}

      <AdminPageHeader
        eyebrow="Catalogue"
        title="Products."
        description="The full range, pricing and availability. Archive a product to hide it without deleting its history."
        action={
          <Link href="/admin/products/new" className={buttonClasses("primary")}>
            <Plus aria-hidden="true" />
            Add product
          </Link>
        }
      />

      <AdminPanel
        title="All products"
        meta={
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
            {products.length} {products.length === 1 ? "product" : "products"}
          </span>
        }
      >
        {products.length === 0 ? (
          <AdminEmpty
            title="No products yet."
            body="Create the first product, then add colourways and stock."
            action={
              <Link href="/admin/products/new" className={buttonClasses("primary")}>
                Add product
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
                  <Th>Type</Th>
                  <Th>Collections</Th>
                  <Th>Availability</Th>
                  <Th>Price</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-bone/[0.03]">
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center">
                              <LifterMark className="h-5 opacity-30" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="block truncate text-sm font-medium text-bone hover:text-accent"
                          >
                            {product.name}
                          </Link>
                          <span className="block truncate font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                            {product.slug}
                          </span>
                        </div>
                      </div>
                    </Td>
                    <Td className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone-dim">
                      {PRODUCT_TYPE_LABELS[product.product_type]}
                    </Td>
                    <Td className="text-xs text-bone-dim">
                      {product.collectionNames.length ? product.collectionNames.join(", ") : "None"}
                    </Td>
                    <Td>
                      <span
                        className={
                          product.availableCount > 0
                            ? "font-mono text-xs text-emerald-300"
                            : "font-mono text-xs text-red-300"
                        }
                      >
                        {product.availableCount === 0
                          ? "Sold out"
                          : product.availableCount < product.variantCount
                            ? "Partly sold out"
                            : "Available"}
                      </span>
                      <span className="block text-[10px] text-bone-dim">
                        {product.availableCount} of {product.variantCount}{" "}
                        {product.variantCount === 1 ? "variant" : "variants"} ·{" "}
                        {product.colourCount} {product.colourCount === 1 ? "colour" : "colours"}
                      </span>
                    </Td>
                    <Td className="font-mono text-xs">{formatPriceCents(product.price_cents)}</Td>
                    <Td>
                      <div className="flex flex-col gap-1 text-[10px] font-mono uppercase tracking-[0.1em]">
                        <span className={product.is_active ? "text-emerald-300" : "text-bone-dim"}>
                          {product.is_active ? "Active" : "Archived"}
                        </span>
                        {product.is_featured ? (
                          <span className="text-accent">Featured</span>
                        ) : null}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        <ToggleButton
                          productId={product.id}
                          flag="is_featured"
                          value={!product.is_featured}
                          label={product.is_featured ? "Remove from featured" : "Feature product"}
                          icon={product.is_featured ? StarOff : Star}
                        />
                        <ToggleButton
                          productId={product.id}
                          flag="is_active"
                          value={!product.is_active}
                          label={product.is_active ? "Archive product" : "Restore product"}
                          icon={product.is_active ? Archive : ArchiveRestore}
                        />
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] border border-line text-bone-dim transition-colors hover:border-bone hover:text-bone"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
              </TableShell>
            </div>

            <ul className="divide-y divide-line md:hidden">
              {products.map((product) => (
                <li key={product.id} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised">
                      {product.image ? (
                        <Image src={product.image} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center">
                          <LifterMark className="h-5 opacity-30" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-sm font-medium text-bone hover:text-accent"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                        {PRODUCT_TYPE_LABELS[product.product_type]} · {formatPriceCents(product.price_cents)}
                      </p>
                      <p className="mt-1 text-xs text-bone-dim">
                        {product.availableCount === 0
                          ? "Sold out"
                          : `${product.availableCount} of ${product.variantCount} available`}{" "}
                        · {product.colourCount} colours
                        {product.is_active ? "" : " · archived"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <ToggleButton
                          productId={product.id}
                          flag="is_featured"
                          value={!product.is_featured}
                          label={product.is_featured ? "Remove from featured" : "Feature product"}
                          icon={product.is_featured ? StarOff : Star}
                        />
                        <ToggleButton
                          productId={product.id}
                          flag="is_active"
                          value={!product.is_active}
                          label={product.is_active ? "Archive product" : "Restore product"}
                          icon={product.is_active ? Archive : ArchiveRestore}
                        />
                        <Link
                          href={`/admin/products/${product.id}`}
                          className={buttonClasses("secondary", "min-h-11")}
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </AdminPanel>
    </>
  );
}
