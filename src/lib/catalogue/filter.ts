import {
  SIZE_ORDER,
  type CatalogueColour,
  type CatalogueFilters,
  type CatalogueProduct,
  type GarmentSize,
} from "./types";

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
  const { collection, sizes = [], colours = [], query = "", sort = "featured" } = filters;

  const filtered = products.filter((product) => {
    if (collection && !product.collectionSlugs.includes(collection)) return false;
    if (sizes.length > 0 && !sizes.some((size) => product.sizes.includes(size))) return false;
    if (
      colours.length > 0 &&
      !product.colours.some((colour) => colour.inStock && colours.includes(colour.slug))
    ) {
      return false;
    }
    if (query.trim() && !matchesSearch(product, query)) return false;
    return true;
  });

  if (sort === "price-asc") {
    return filtered.sort((a, b) => a.priceCents - b.priceCents || a.sortOrder - b.sortOrder);
  }

  if (sort === "price-desc") {
    return filtered.sort((a, b) => b.priceCents - a.priceCents || a.sortOrder - b.sortOrder);
  }

  return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getColourOptions(products: CatalogueProduct[]): CatalogueColour[] {
  const seen = new Map<string, CatalogueColour>();

  for (const product of products) {
    for (const colour of product.colours) {
      if (colour.inStock && !seen.has(colour.slug)) {
        seen.set(colour.slug, colour);
      }
    }
  }

  return [...seen.values()];
}

export function getSizeOptions(products: CatalogueProduct[]): GarmentSize[] {
  const seen = new Set<GarmentSize>();

  for (const product of products) {
    for (const size of product.sizes) {
      seen.add(size);
    }
  }

  return SIZE_ORDER.filter((size) => seen.has(size));
}
