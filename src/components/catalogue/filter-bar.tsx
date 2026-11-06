"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";
import {
  parseSort,
  sortHref,
  type CatalogueSearchParams,
} from "@/lib/catalogue/params";
import type { CatalogueSort } from "@/lib/catalogue/types";

const SORTS: { value: CatalogueSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "best-sellers", label: "Best sellers" },
];

export function FilterBar({
  basePath,
  params,
  resultCount,
}: {
  basePath: string;
  params: CatalogueSearchParams;
  resultCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const sort = parseSort(params.sort);

  const handleSort = (next: CatalogueSort) => {
    startTransition(() => {
      router.push(sortHref(basePath, params, next), { scroll: false });
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-dim"
        aria-live="polite"
      >
        {resultCount} {resultCount === 1 ? "piece" : "pieces"}
      </p>

      <div className="flex items-center gap-3">
        {sort !== "newest" ? (
          <button
            type="button"
            onClick={() => handleSort("newest")}
            className="inline-flex min-h-11 items-center font-mono text-[10px] uppercase tracking-[0.16em] text-accent transition-colors hover:text-bone"
          >
            Clear
          </button>
        ) : null}

        <label className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-dim">
            Sort
          </span>
          <span className="relative">
            <select
              value={sort}
              onChange={(event) => handleSort(event.target.value as CatalogueSort)}
              aria-label="Sort products"
              className="h-11 cursor-pointer appearance-none rounded-full border border-line bg-ink-soft pl-4 pr-10 font-mono text-base uppercase tracking-[0.14em] text-bone transition-colors hover:border-bone/40 focus:border-accent focus:outline-none sm:text-[10px]"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-bone-dim"
              strokeWidth={1.7}
            />
          </span>
        </label>

        <span
          aria-hidden="true"
          className={`h-4 w-px bg-line transition-opacity ${pending ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  );
}
