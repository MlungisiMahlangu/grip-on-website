import Image from "next/image";
import Link from "next/link";
import { formatPriceCents } from "@/lib/utils";
import type { CatalogueProduct } from "@/lib/catalogue/types";
import { LifterMark } from "@/components/brand/lifter-mark";
import { WishlistButton } from "@/components/catalogue/wishlist-button";

export function ProductCard({
  product,
  priority = false,
}: {
  product: CatalogueProduct;
  priority?: boolean;
}) {
  const defaultColour = product.colours.find((colour) => colour.id === product.defaultColourId);
  const availableColours = product.colours.filter((colour) => colour.inStock);
  const soldOut = availableColours.length === 0;
  const front = product.images.front;
  const back = product.images.back;
  const alt = defaultColour ? `${product.name} in ${defaultColour.name}` : product.name;

  return (
    <article className="group relative">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-soft">
          {front ? (
            <>
              <Image
                src={front}
                alt={alt}
                fill
                priority={priority}
                fetchPriority={priority ? "high" : undefined}
                loading={priority ? "eager" : undefined}
                sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, 50vw"
                className={
                  back
                    ? "object-cover transition-opacity duration-500 group-hover:opacity-0 group-focus-within:opacity-0"
                    : "object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                }
              />
              {back ? (
                <Image
                  src={back}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, 50vw"
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
                />
              ) : null}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <LifterMark className="h-12 opacity-30" />
            </div>
          )}

          {soldOut ? (
            <div className="pointer-events-none absolute left-3 top-3 z-10">
              <span className="rounded-full bg-ink/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-bone backdrop-blur-sm">
                Sold out
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-sans text-body font-semibold uppercase tracking-[0.06em] text-bone">
              {product.name}
            </h2>
            {product.tagline ? (
              <p className="mt-1 truncate text-caption text-bone-dim">{product.tagline}</p>
            ) : null}
          </div>
          <p className="shrink-0 font-mono text-caption text-bone">
            {formatPriceCents(product.priceCents)}
          </p>
        </div>

        {availableColours.length > 0 ? (
          <div className="mt-2.5 flex items-center gap-1" aria-hidden="true">
            {availableColours.slice(0, 5).map((colour) => (
              <span
                key={colour.id}
                className="h-2.5 w-2.5 rounded-full border border-bone/25"
                style={{ backgroundColor: colour.hex }}
              />
            ))}
          </div>
        ) : null}
      </Link>

      <WishlistButton
        slug={product.slug}
        name={product.name}
        className="absolute right-2.5 top-2.5 z-10"
      />
    </article>
  );
}
