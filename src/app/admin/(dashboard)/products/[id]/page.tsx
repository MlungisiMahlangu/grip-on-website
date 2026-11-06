import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Plus, Trash2 } from "lucide-react";
import { getAdminProduct } from "@/lib/admin/queries";
import { PRODUCT_TYPE_LABELS } from "@/lib/admin/schemas";
import {
  deleteProductAction,
  setAvailabilityAction,
  setColourActiveAction,
} from "@/lib/admin/product-actions";
import { formatPriceCents } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/ui/confirm-dialog";
import { AdminPageHeader, AdminPanel } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { ColourForm } from "@/components/admin/colour-form";
import { LifterMark } from "@/components/brand/lifter-mark";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const data = await getAdminProduct(id);
  if (!data) notFound();

  const { product, collections, selectedCollectionIds, colours } = data;
  const anyAvailable = colours.some((colour) =>
    colour.variants.some((variant) => variant.is_available),
  );

  return (
    <>
      <Link
        href="/admin/products"
        className="mb-5 inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:text-bone"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All products
      </Link>

      <AdminPageHeader
        eyebrow={`${PRODUCT_TYPE_LABELS[product.product_type]} · ${formatPriceCents(product.price_cents)}`}
        title={`${product.name}.`}
        description={`${colours.length} ${colours.length === 1 ? "colourway" : "colourways"} · ${product.slug} · ${product.is_active ? "live on the store" : "archived"}`}
        action={
          <>
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              className={buttonClasses("secondary")}
            >
              View store
              <ExternalLink aria-hidden="true" />
            </Link>
            <form action={setAvailabilityAction}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="value" value={String(!anyAvailable)} />
              <button type="submit" className={buttonClasses("secondary")}>
                {anyAvailable ? "Mark sold out" : "Mark available"}
              </button>
            </form>
          </>
        }
      />

      <ProductForm
        product={product}
        collections={collections}
        selectedCollectionIds={selectedCollectionIds}
        saved={saved === "1"}
      />

      <div className="mt-8">
        <AdminPanel
          title="Colourways"
          meta={
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
              {colours.length} {colours.length === 1 ? "colour" : "colours"}
            </span>
          }
        >
          {colours.length === 0 ? (
            <p className="px-4 py-5 text-sm leading-relaxed text-bone-dim sm:px-5">
              No colourways yet. Add one below so the product can appear on the store.
            </p>
          ) : (
            <div className="divide-y divide-line">
              {colours.map((colour) => {
                const availableCount = colour.variants.filter(
                  (variant) => variant.is_available,
                ).length;
                const colourAvailable = availableCount > 0;
                return (
                  <details key={colour.id} className="group">
                    <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3 transition-colors hover:bg-bone/[0.03] sm:px-5">
                      <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised">
                        {colour.frontImage ? (
                          <Image
                            src={colour.frontImage}
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
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm text-bone">
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 rounded-full border border-line-strong"
                            style={{ backgroundColor: colour.hex }}
                          />
                          {colour.name}
                          {!colour.is_active ? (
                            <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-bone-dim">
                              Archived
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                          {colour.slug} · {colour.variants.length}{" "}
                          {colour.variants.length === 1 ? "variant" : "variants"} ·{" "}
                          {availableCount} available
                        </p>
                      </div>
                      <span
                        className={
                          colourAvailable
                            ? "hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300 sm:block"
                            : "hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-red-300 sm:block"
                        }
                      >
                        {colourAvailable ? "Available" : "Sold out"}
                      </span>
                    </summary>

                    <div className="border-t border-line px-4 py-5 sm:px-5">
                      <ColourForm
                        productId={product.id}
                        productSlug={product.slug}
                        productType={product.product_type}
                        colour={colour}
                      />
                      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4">
                        <form action={setAvailabilityAction}>
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="colourId" value={colour.id} />
                          <input type="hidden" name="value" value={String(!colourAvailable)} />
                          <button
                            type="submit"
                            className="inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim transition-colors hover:text-accent"
                          >
                            {colourAvailable ? "Mark colour sold out" : "Mark colour available"}
                          </button>
                        </form>
                        <form action={setColourActiveAction}>
                          <input type="hidden" name="id" value={colour.id} />
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="value" value={String(!colour.is_active)} />
                          <button
                            type="submit"
                            className="inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim transition-colors hover:text-bone"
                          >
                            {colour.is_active ? "Archive this colour" : "Restore this colour"}
                          </button>
                        </form>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          )}

          <details className="border-t border-line">
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-accent transition-colors hover:bg-bone/[0.03] sm:px-5">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add a colourway
            </summary>
            <div className="border-t border-line px-4 py-5 sm:px-5">
              <ColourForm
                productId={product.id}
                productSlug={product.slug}
                productType={product.product_type}
              />
            </div>
          </details>
        </AdminPanel>
      </div>

      <div className="mt-8 rounded-[var(--radius-card)] border border-red-400/25 bg-red-400/[0.04] p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-red-300">
          Delete product
        </p>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-bone-dim">
          Removes the product, its colourways and its variants from the store. Past orders keep
          their item details. This cannot be undone.
        </p>
        <form action={deleteProductAction} className="mt-4">
          <input type="hidden" name="id" value={product.id} />
          <ConfirmSubmit
            title={`Delete ${product.name}?`}
            description="The product, its colourways and variants will be removed from the store. Past orders are not affected. This cannot be undone."
            confirmLabel="Delete product"
            className={buttonClasses("secondary", "border-red-400/40 text-red-300")}
          >
            <Trash2 aria-hidden="true" />
            Delete product
          </ConfirmSubmit>
        </form>
      </div>
    </>
  );
}
