"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CatalogueProduct } from "@/lib/catalogue/types";
import { useHydrated } from "@/hooks/use-hydrated";
import { useWishlistStore } from "@/store/wishlist";
import { LifterMark } from "@/components/brand/lifter-mark";
import { ProductGrid } from "@/components/catalogue/product-grid";
import { buttonClasses } from "@/components/ui/button";

export function WishlistView({ products }: { products: CatalogueProduct[] }) {
  const slugs = useWishlistStore((state) => state.slugs);
  const clear = useWishlistStore((state) => state.clear);
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[4/5] animate-pulse rounded-[var(--radius-card)] bg-ink-soft"
          />
        ))}
      </div>
    );
  }

  const saved = products.filter((product) => slugs.includes(product.slug));

  if (saved.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line px-6 py-16 text-center">
        <LifterMark className="mx-auto h-10 opacity-40" />
        <h2 className="display mt-5 text-3xl">Nothing saved yet.</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-bone-dim">
          Tap the heart on any piece to keep it here for later.
        </p>
        <Link href="/shop" className={buttonClasses("primary", "mt-7")}>
          Shop the range <ArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-dim">
          {saved.length} {saved.length === 1 ? "piece" : "pieces"} saved
        </p>
        <button
          type="button"
          onClick={clear}
          className="inline-flex min-h-11 items-center font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:text-accent"
        >
          Clear wishlist
        </button>
      </div>

      <div className="mt-6">
        <ProductGrid products={saved} priorityCount={2} />
      </div>
    </div>
  );
}
