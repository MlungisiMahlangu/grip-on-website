import { SIZE_ORDER, type CatalogueSort, type GarmentSize } from "./types";

export type CatalogueSearchParams = Record<string, string | string[] | undefined>;

export function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseList(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(",") : value;
  if (!raw) return [];

  return [
    ...new Set(
      raw
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  ];
}

export function parseSizes(value: string | string[] | undefined): GarmentSize[] {
  return parseList(value).filter((size): size is GarmentSize =>
    (SIZE_ORDER as string[]).includes(size),
  );
}

export function parseSort(value: string | string[] | undefined): CatalogueSort {
  const sort = firstValue(value);
  return sort === "price-asc" || sort === "price-desc" ? sort : "featured";
}

function toQuery(params: CatalogueSearchParams): URLSearchParams {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
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

export function toggleHref(
  basePath: string,
  params: CatalogueSearchParams,
  key: "sizes" | "colours",
  value: string,
): string {
  const values = new Set(parseList(params[key]));

  if (values.has(value)) values.delete(value);
  else values.add(value);

  return hrefWith(basePath, params, {
    [key]: values.size > 0 ? [...values].join(",") : null,
  });
}

export function sortHref(
  basePath: string,
  params: CatalogueSearchParams,
  sort: CatalogueSort,
): string {
  return hrefWith(basePath, params, { sort: sort === "featured" ? null : sort });
}

export function clearFiltersHref(basePath: string): string {
  return basePath;
}
