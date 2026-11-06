"use client";

import { useCallback, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDialog } from "@/hooks/use-dialog";
import { useProductSearch } from "@/hooks/use-product-search";
import {
  SearchResultRow,
  SearchStatusMessage,
} from "@/components/search/search-results";

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const { status, results } = useProductSearch(open ? query : "");
  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);
  const dialogRef = useDialog<HTMLDivElement>(open, close);
  const trimmed = query.trim();
  const activeResult = results.length === 0 ? 0 : Math.min(activeIndex, results.length - 1);

  const goToResults = () => {
    if (!trimmed) return;
    close();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const goToActive = () => {
    const result = results[activeResult];
    if (result) {
      close();
      router.push(`/products/${result.slug}`);
      return;
    }
    goToResults();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (results.length > 0) {
        setActiveIndex((index) => Math.min(index + 1, results.length - 1));
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      goToActive();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        aria-haspopup="dialog"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-card)] text-bone transition-colors hover:text-accent"
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={1.7} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close search"
            onClick={close}
            className="absolute inset-0 bg-ink/75 backdrop-blur-sm"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            className="relative mx-auto mt-0 flex h-full w-full flex-col border-line bg-ink px-4 pb-6 pt-4 sm:mt-[8vh] sm:h-auto sm:max-h-[80vh] sm:w-[min(92vw,640px)] sm:rounded-[var(--radius-card)] sm:border sm:p-5"
          >
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <Search
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-bone-dim"
                strokeWidth={1.7}
              />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value.slice(0, 80));
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search tees, hoodies, accessories"
                aria-label="Search products"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls="search-overlay-results"
                aria-autocomplete="list"
                aria-activedescendant={
                  results[activeResult] ? `search-result-${activeResult}` : undefined
                }
                autoComplete="off"
                spellCheck={false}
                className="h-11 min-w-0 flex-1 bg-transparent text-base text-bone placeholder:text-bone-dim focus:outline-none"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-card)] text-bone-dim transition-colors hover:text-bone"
              >
                <X className="h-5 w-5" strokeWidth={1.7} />
              </button>
            </div>

            <div
              id="search-overlay-results"
              role="listbox"
              aria-label="Search results"
              className="mt-3 flex-1 overflow-y-auto sm:max-h-[60vh]"
            >
              {!trimmed ? (
                <div className="px-2 py-8 text-center">
                  <p className="text-sm text-bone-dim">
                    Start typing to search the full range.
                  </p>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-bone-dim">
                    Use arrow keys to move, Enter to open
                  </p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <SearchResultRow
                      key={result.slug}
                      result={result}
                      id={`search-result-${index}`}
                      active={index === activeResult}
                      onSelect={close}
                    />
                  ))}
                </div>
              ) : (
                <SearchStatusMessage status={status} query={trimmed} />
              )}
            </div>

            {trimmed && results.length > 0 ? (
              <button
                type="button"
                onClick={goToResults}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center border-t border-line pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-accent transition-colors hover:text-bone"
              >
                View all results for “{trimmed}”
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
