import type { CatalogueFilters, CatalogueProduct } from "./types";

function searchableText(product: CatalogueProduct) {
  return [
    product.name,
    product.tagline ?? "",
    product.description ?? "",
    product.productType,
    product.slug.replace(/-/g, " "),
    ...product.details,
    ...product.colours.map((colour) => colour.name),
  ]
    .join(" ")
    .toLowerCase();
}

export function matchesSearch(product: CatalogueProduct, query: string) {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) return true;

  const text = searchableText(product);
  return tokens.every((token) => text.includes(token));
}

export function filterProducts(
  products: CatalogueProduct[],
  filters: CatalogueFilters = {},
): CatalogueProduct[] {
  const { collection, query = "", sort = "newest" } = filters;

  const filtered = products.filter((product) => {
    if (collection && !product.collectionSlugs.includes(collection)) return false;
    if (query.trim() && !matchesSearch(product, query)) return false;
    return true;
  });

  switch (sort) {
    case "price-asc":
      return filtered.sort(
        (a, b) => a.priceCents - b.priceCents || a.sortOrder - b.sortOrder,
      );
    case "price-desc":
      return filtered.sort(
        (a, b) => b.priceCents - a.priceCents || a.sortOrder - b.sortOrder,
      );
    case "best-sellers":
      return filtered.sort(
        (a, b) =>
          Number(b.isFeatured) - Number(a.isFeatured) ||
          a.sortOrder - b.sortOrder ||
          Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );
    default:
      return filtered.sort(
        (a, b) =>
          Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
          a.sortOrder - b.sortOrder,
      );
  }
}
