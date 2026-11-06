"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  RotateCcw,
  Truck,
} from "lucide-react";
import { cn, formatPriceCents } from "@/lib/utils";
import {
  SIZE_LABELS,
  type CatalogueColour,
  type CatalogueProduct,
  type CatalogueSize,
  type GarmentSize,
} from "@/lib/catalogue/types";
import type { ProductType } from "@/lib/supabase/types";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { useStorefrontSettings } from "@/components/providers/storefront-settings-provider";
import { buttonClasses } from "@/components/ui/button";
import { LifterMark } from "@/components/brand/lifter-mark";
import { WishlistButton } from "@/components/catalogue/wishlist-button";

const TYPE_LABELS: Record<ProductType, string> = {
  tee: "Tee",
  hoodie: "Hoodie",
  tank: "Tank",
  bottoms: "Bottoms",
  accessory: "Accessory",
};

function stockMessage(colour: CatalogueColour | null, size: CatalogueSize | null) {
  if (!colour) return "This piece is sold out.";
  if (!size) return "Select a size to continue.";
  if (!size.inStock) return "This size is sold out.";
  if (size.stock <= 3) return `Only ${size.stock} left in ${colour.name}.`;
  return "In stock, ready to ship.";
}

export function ProductView({ product }: { product: CatalogueProduct }) {
  const initialColour =
    product.colours.find((colour) => colour.id === product.defaultColourId) ??
    product.colours[0] ??
    null;

  const [colourId, setColourId] = useState<string>(initialColour?.id ?? "");
  const [selectedSize, setSelectedSize] = useState<GarmentSize | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const colour = product.colours.find((entry) => entry.id === colourId) ?? initialColour;
  const activeColours = product.colours.filter((entry) => entry.inStock);
  const images = colour?.gallery ?? [];
  const currentImage = images[imageIndex] ?? null;
  const size = colour?.sizes.find((entry) => entry.size === selectedSize) ?? null;
  const soldOut = product.totalStock === 0;
  const canAdd = Boolean(colour && size?.inStock);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);
  const { freeDeliveryThresholdCents } = useStorefrontSettings();

  const selectColour = (id: string) => {
    setColourId(id);
    setSelectedSize(null);
    setImageIndex(0);
  };

  const stepImage = (direction: 1 | -1) => {
    if (images.length < 2) return;
    setImageIndex((index) => (index + direction + images.length) % images.length);
  };

  const handleAdd = () => {
    if (!colour || !size?.inStock) return;

    addItem({
      variantId: size.variantId,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      colourName: colour.name,
      colourSlug: colour.slug,
      size: size.size,
      priceCents: product.priceCents,
      imageUrl: images[0] ?? null,
      maxQuantity: size.stock,
      quantity: 1,
    });
    openCart();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-soft">
          {currentImage ? (
            <Image
              src={currentImage}
              alt={`${product.name}${colour ? ` in ${colour.name}` : ""} — image ${imageIndex + 1} of ${images.length}`}
              fill
              priority
              loading="eager"
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <LifterMark className="h-16 opacity-30" />
            </div>
          )}

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => stepImage(-1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-bone/15 bg-ink/70 text-bone backdrop-blur-sm transition-colors hover:border-bone/40 hover:text-accent"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => stepImage(1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-bone/15 bg-ink/70 text-bone backdrop-blur-sm transition-colors hover:border-bone/40 hover:text-accent"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-ink/75 px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] text-bone backdrop-blur-sm">
                {imageIndex + 1} / {images.length}
              </span>
            </>
          ) : null}
        </div>

        {images.length > 1 ? (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setImageIndex(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={index === imageIndex ? "true" : undefined}
                className={cn(
                  "relative h-20 w-16 shrink-0 overflow-hidden rounded-[var(--radius-card)] border transition-opacity",
                  index === imageIndex
                    ? "border-accent"
                    : "border-line opacity-60 hover:opacity-100",
                )}
              >
                <Image
                  src={image}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow text-accent">{TYPE_LABELS[product.productType]}</p>

          <div className="mt-3 flex items-start justify-between gap-4">
            <h1 className="display text-[clamp(2.75rem,6vw,5rem)]">{product.name}</h1>
            <WishlistButton
              slug={product.slug}
              name={product.name}
              className="mt-1 shrink-0 bg-transparent"
            />
          </div>

          {product.tagline ? (
            <p className="mt-3 text-sm text-bone-dim">{product.tagline}</p>
          ) : null}

          <div className="mt-5 flex items-baseline gap-3">
            <p className="font-mono text-lg text-bone">{formatPriceCents(product.priceCents)}</p>
            {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents ? (
              <p className="font-mono text-sm text-bone-dim line-through">
                {formatPriceCents(product.compareAtPriceCents)}
              </p>
            ) : null}
          </div>

          {product.description ? (
            <p className="mt-5 text-sm leading-relaxed text-bone-dim">{product.description}</p>
          ) : null}

          {soldOut ? (
            <div className="mt-7 rounded-[var(--radius-card)] border border-line bg-ink-soft px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                Sold out
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-bone-dim">
                This piece is sold out for now. Follow us to hear when it lands again.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-7">
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow text-bone-dim">Colour</p>
                  <p className="text-xs text-bone">{colour?.name}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeColours.map((option) => {
                    const active = option.id === colour?.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => selectColour(option.id)}
                        aria-label={`Select ${option.name}`}
                        aria-pressed={active}
                        className={cn(
                          "flex min-h-11 min-w-11 items-center justify-center rounded-full border p-1.5 transition-colors",
                          active
                            ? "border-accent"
                            : "border-line hover:border-bone/40",
                        )}
                      >
                        <span
                          className="h-6 w-6 rounded-full border border-bone/20"
                          style={{ backgroundColor: option.hex }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {colour ? (
                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="eyebrow text-bone-dim">Size</p>
                    <p className="text-xs text-bone-dim">
                      {colour.sizes.length === 1 ? "One size" : "Select a size"}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "mt-3 grid gap-2",
                      colour.sizes.length === 1 ? "grid-cols-1" : "grid-cols-3 sm:grid-cols-6",
                    )}
                  >
                    {colour.sizes.map((option) => {
                      const active = selectedSize === option.size;
                      return (
                        <button
                          key={option.variantId}
                          type="button"
                          onClick={() => setSelectedSize(option.size)}
                          disabled={!option.inStock}
                          aria-pressed={active}
                          aria-label={
                            option.inStock
                              ? `Select size ${SIZE_LABELS[option.size]}`
                              : `Size ${SIZE_LABELS[option.size]} sold out`
                          }
                          className={cn(
                            "min-h-11 rounded-[var(--radius-card)] border font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                            active
                              ? "border-accent bg-accent text-accent-ink"
                              : option.inStock
                                ? "border-line text-bone hover:border-bone"
                                : "cursor-not-allowed border-line/50 text-bone-dim/50 line-through",
                          )}
                        >
                          {SIZE_LABELS[option.size]}
                        </button>
                      );
                    })}
                  </div>
                  <p aria-live="polite" className="mt-3 text-xs text-bone-dim">
                    {stockMessage(colour, size)}
                  </p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleAdd}
                disabled={!canAdd}
                className={buttonClasses("primary", "mt-6 w-full")}
              >
                Add to bag
              </button>
            </>
          )}

          <ul className="mt-8 space-y-3 border-t border-line pt-6 text-sm text-bone-dim">
            <li className="flex items-start gap-3">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.7} />
              <span>
                Free delivery over {formatPriceCents(freeDeliveryThresholdCents)}. Couriers
                nationwide.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.7} />
              <span>Cash on delivery. Pay when your order arrives.</span>
            </li>
            <li className="flex items-start gap-3">
              <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.7} />
              <span>14-day returns on unworn pieces.</span>
            </li>
          </ul>

          {product.details.length > 0 ? (
            <div className="mt-8 border-t border-line pt-6">
              <h2 className="eyebrow text-bone-dim">Details</h2>
              <ul className="mt-3 space-y-1.5">
                {product.details.map((detail) => (
                  <li key={detail} className="flex gap-2 text-sm text-bone-dim">
                    <span className="text-accent" aria-hidden="true">
                      —
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
