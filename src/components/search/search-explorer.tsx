"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useProductSearch, type SearchResult } from "@/hooks/use-product-search";
import { SearchResultGrid, SearchStatusMessage } from "@/components/search/search-results";
import { buttonClasses } from "@/components/ui/button";

const URL_DEBOUNCE_MS = 300;

export function SearchExplorer({
  initialQuery,
  suggestions,
}: {
  initialQuery: string;
  suggestions: SearchResult[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const { status, results } = useProductSearch(query);
  const router = useRouter();
  const trimmed = query.trim();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search";
      router.replace(next, { scroll: false });
    }, URL_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [trimmed, router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmed) return;
    router.replace(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setQuery("");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} role="search" className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="search-page-input" className="sr-only">
          Search products
        </label>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bone-dim"
            strokeWidth={1.7}
            aria-hidden="true"
          />
          <input
            id="search-page-input"
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value.slice(0, 80))}
            onKeyDown={handleKeyDown}
            placeholder="Search tees, hoodies, accessories"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="search-page-status"
            className="h-12 w-full rounded-[var(--radius-card)] border border-line bg-ink-soft pl-11 pr-12 text-base text-bone placeholder:text-bone-dim focus:border-accent focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[var(--radius-card)] text-bone-dim transition-colors hover:text-bone"
            >
              <X className="h-4 w-4" strokeWidth={1.7} />
            </button>
          ) : null}
        </div>
        <button type="submit" className={buttonClasses("primary", "h-12")}>
          Search
        </button>
      </form>

      <div id="search-page-status" aria-live="polite" className="mt-8">
        {!trimmed ? (
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="eyebrow text-bone-dim">Popular right now</p>
            </div>
            <div className="mt-5">
              <SearchResultGrid results={suggestions} priorityCount={2} />
            </div>
          </div>
        ) : status === "loading" ? (
          <SearchStatusMessage status="loading" query={trimmed} />
        ) : results.length > 0 ? (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-dim">
              {results.length} {results.length === 1 ? "result" : "results"} for{" "}
              <span className="text-bone">“{trimmed}”</span>
            </p>
            <div className="mt-5">
              <SearchResultGrid results={results} priorityCount={2} />
            </div>
          </div>
        ) : (
          <SearchStatusMessage status={status} query={trimmed} />
        )}
      </div>
    </div>
  );
}
