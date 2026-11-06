import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  SIZE_LABELS,
  SIZE_ORDER,
  type CatalogueColour,
  type CatalogueSort,
  type GarmentSize,
} from "@/lib/catalogue/types";
import {
  clearFiltersHref,
  parseList,
  parseSizes,
  parseSort,
  sortHref,
  toggleHref,
  type CatalogueSearchParams,
} from "@/lib/catalogue/params";

const SORTS: { value: CatalogueSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Lowest price" },
  { value: "price-desc", label: "Highest price" },
];

function chipClass(active: boolean) {
  return cn(
    "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border px-3.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
    active
      ? "border-bone bg-bone text-ink"
      : "border-line text-bone-dim hover:border-bone/40 hover:text-bone",
  );
}

export function FilterBar({
  basePath,
  params,
  sizes,
  colours,
  resultCount,
}: {
  basePath: string;
  params: CatalogueSearchParams;
  sizes: GarmentSize[];
  colours: CatalogueColour[];
  resultCount: number;
}) {
  const activeSizes = parseSizes(params.sizes);
  const activeColours = parseList(params.colours);
  const sort = parseSort(params.sort);
  const hasFilters = activeSizes.length > 0 || activeColours.length > 0 || sort !== "featured";
  const availableSizes = SIZE_ORDER.filter((size) => sizes.includes(size));

  return (
    <div className="space-y-5 border-y border-line py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-dim">
          {resultCount} {resultCount === 1 ? "piece" : "pieces"}
          {hasFilters ? " filtered" : ""}
        </p>

        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
          <span className="eyebrow text-bone-dim">Sort</span>
          <div className="flex flex-wrap gap-1">
            {SORTS.map((option) => {
              const active = sort === option.value;
              return (
                <Link
                  key={option.value}
                  href={sortHref(basePath, params, option.value)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full px-3 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
                    active ? "bg-ink-raised text-bone" : "text-bone-dim hover:text-bone",
                  )}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
        <span className="w-16 shrink-0 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-dim">
          Size
        </span>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0">
          {availableSizes.map((size) => (
            <Link
              key={size}
              href={toggleHref(basePath, params, "sizes", size)}
              aria-current={activeSizes.includes(size) ? "true" : undefined}
              className={chipClass(activeSizes.includes(size))}
            >
              {SIZE_LABELS[size]}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
        <span className="w-16 shrink-0 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-dim">
          Colour
        </span>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0">
          {colours.map((colour) => {
            const active = activeColours.includes(colour.slug);
            return (
              <Link
                key={colour.slug}
                href={toggleHref(basePath, params, "colours", colour.slug)}
                aria-current={active ? "true" : undefined}
                className={chipClass(active)}
              >
                <span
                  aria-hidden="true"
                  className="mr-2 h-3 w-3 rounded-full border border-bone/25"
                  style={{ backgroundColor: colour.hex }}
                />
                {colour.name}
              </Link>
            );
          })}
        </div>
      </div>

      {hasFilters ? (
        <div>
          <Link
            href={clearFiltersHref(basePath)}
            className="inline-flex min-h-11 items-center font-mono text-[10px] uppercase tracking-[0.16em] text-accent transition-colors hover:text-bone"
          >
            Clear filters
          </Link>
        </div>
      ) : null}
    </div>
  );
}
