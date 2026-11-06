import { Search } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export function SearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form
      action="/search"
      method="get"
      role="search"
      className="flex flex-col gap-2 sm:flex-row"
    >
      <label htmlFor="search-input" className="sr-only">
        Search products
      </label>
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bone-dim"
          strokeWidth={1.7}
          aria-hidden="true"
        />
        <input
          id="search-input"
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search tees, hoodies, accessories"
          autoComplete="off"
          className="h-12 w-full rounded-[var(--radius-card)] border border-line bg-ink-soft pl-11 pr-4 text-sm text-bone placeholder:text-bone-dim focus:border-accent focus:outline-none"
        />
      </div>
      <button type="submit" className={buttonClasses("primary", "h-12")}>
        Search
      </button>
    </form>
  );
}
