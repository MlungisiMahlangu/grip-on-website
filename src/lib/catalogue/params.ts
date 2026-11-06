import type { CatalogueSort } from "./types";

export type CatalogueSearchParams = Record<string, string | string[] | undefined>;

const LEGACY_FILTER_KEYS = new Set(["sizes", "colours"]);

export const CATALOGUE_PAGE_SIZE = 12;

export function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseLimit(value: string | string[] | undefined): number {
  const raw = Number(firstValue(value));

  if (!Number.isFinite(raw) || raw < CATALOGUE_PAGE_SIZE) {
    return CATALOGUE_PAGE_SIZE;
  }

  return Math.min(Math.floor(raw), 200);
}

export function parseSort(value: string | string[] | undefined): CatalogueSort {
  const sort = firstValue(value);

  if (sort === "price-asc" || sort === "price-desc" || sort === "best-sellers") {
    return sort;
  }

  return "newest";
}

function toQuery(params: CatalogueSearchParams): URLSearchParams {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || LEGACY_FILTER_KEYS.has(key)) continue;
    if (Array.isArray(value)) {
      for (const entry of value) query.append(key, entry);
    } else {
      query.set(key, value);
    }
  }

  return query;
}

export function hrefWith(
  basePath: string,
  params: CatalogueSearchParams,
  updates: Record<string, string | null>,
): string {
  const query = toQuery(params);

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === "") query.delete(key);
    else query.set(key, value);
  }

  const search = query.toString();
  return search ? `${basePath}?${search}` : basePath;
}

export function sortHref(
  basePath: string,
  params: CatalogueSearchParams,
  sort: CatalogueSort,
): string {
  return hrefWith(basePath, params, { sort: sort === "newest" ? null : sort });
}

export function clearFiltersHref(basePath: string): string {
  return basePath;
}
