import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CatalogueCollection } from "@/lib/catalogue/types";

export function CategoryNav({
  collections,
  activeSlug,
}: {
  collections: CatalogueCollection[];
  activeSlug?: string;
}) {
  return (
    <nav
      aria-label="Shop by collection"
      className="flex flex-wrap gap-2 pb-1"
    >
      <Link
        href="/shop"
        aria-current={!activeSlug ? "page" : undefined}
        className={cn(
          "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
          !activeSlug
            ? "border-accent bg-accent text-accent-ink"
            : "border-line text-bone-dim hover:border-bone/40 hover:text-bone",
        )}
      >
        All
      </Link>
      {collections.map((collection) => {
        const active = collection.slug === activeSlug;
        return (
          <Link
            key={collection.id}
            href={`/collections/${collection.slug}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
              active
                ? "border-accent bg-accent text-accent-ink"
                : "border-line text-bone-dim hover:border-bone/40 hover:text-bone",
            )}
          >
            {collection.name}
            <span className={cn("text-[9px]", active ? "text-accent-ink/70" : "text-bone-dim")}>
              {collection.productCount}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
