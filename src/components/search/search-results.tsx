import Image from "next/image";
import Link from "next/link";
import { cn, formatPriceCents } from "@/lib/utils";
import type { ProductType } from "@/lib/supabase/types";
import type { SearchResult, SearchStatus } from "@/hooks/use-product-search";
import { LifterMark } from "@/components/brand/lifter-mark";

export const SEARCH_TYPE_LABELS: Record<ProductType, string> = {
  tee: "Tee",
  hoodie: "Hoodie",
  tank: "Tank",
  bottoms: "Bottoms",
  accessory: "Accessory",
};

export function SearchStatusMessage({ status, query }: { status: SearchStatus; query: string }) {
  if (status === "loading") {
    return (
      <p className="flex items-center gap-2 px-2 py-6 text-sm text-bone-dim" role="status">
        <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        Searching...
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="px-2 py-6 text-sm text-bone-dim" role="status">
        Search is unavailable right now. Try again in a moment.
      </p>
    );
  }

  if (status === "done" && query.trim()) {
    return (
      <p className="px-2 py-6 text-sm text-bone-dim" role="status">
        No results for <span className="text-bone">“{query.trim()}”</span>. Try a different word.
      </p>
    );
  }

  return null;
}

export function SearchResultRow({
  result,
  active,
  id,
  onSelect,
}: {
  result: SearchResult;
  active?: boolean;
  id?: string;
  onSelect?: () => void;
}) {
  return (
    <Link
      href={`/products/${result.slug}`}
      id={id}
      role="option"
      aria-selected={active}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-card)] px-2 py-2 transition-colors",
        active ? "bg-ink-raised" : "hover:bg-ink-raised",
      )}
    >
      <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-[calc(var(--radius-card)-4px)] border border-line bg-[#101010]">
        {result.image ? (
          <Image
            src={result.image}
            alt=""
            aria-hidden="true"
            fill
            sizes="56px"
            className="object-contain"
          />
        ) : (
          <span className="flex h-full items-center justify-center">
            <LifterMark className="h-5 opacity-30" />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-sans text-sm font-semibold uppercase tracking-[0.04em] text-bone">
          {result.name}
        </span>
        <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-bone-dim">
          {SEARCH_TYPE_LABELS[result.type]}
        </span>
      </span>
      <span className="shrink-0 font-mono text-xs text-bone">
        {formatPriceCents(result.priceCents)}
      </span>
    </Link>
  );
}

export function SearchResultGrid({
  results,
  priorityCount = 0,
}: {
  results: SearchResult[];
  priorityCount?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
      {results.map((result, index) => (
        <Link key={result.slug} href={`/products/${result.slug}`} className="group block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] border border-line bg-[#101010]">
            {result.image ? (
              <Image
                src={result.image}
                alt={result.name}
                fill
                priority={index < priorityCount}
                fetchPriority={index < priorityCount ? "high" : undefined}
                loading={index < priorityCount ? "eager" : undefined}
                sizes="(min-width: 1024px) 22vw, 50vw"
                className="object-contain transition-transform duration-700 group-hover:scale-[1.02]"
              />
            ) : (
              <span className="flex h-full items-center justify-center">
                <LifterMark className="h-12 opacity-30" />
              </span>
            )}
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate font-sans text-body font-semibold uppercase tracking-[0.06em] text-bone">
                {result.name}
              </h2>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-bone-dim">
                {SEARCH_TYPE_LABELS[result.type]}
              </p>
            </div>
            <p className="shrink-0 font-mono text-caption text-bone">
              {formatPriceCents(result.priceCents)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
