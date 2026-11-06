import "server-only";

import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/supabase/media";
import type { Collection, Product, ProductColour, ProductVariant } from "@/lib/supabase/types";
import {
  LOW_STOCK_THRESHOLD,
  SIZE_ORDER,
  type Catalogue,
  type CatalogueCollection,
  type CatalogueColour,
  type CatalogueProduct,
} from "./types";

function unique(values: (string | null)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function sizeRank(size: string) {
  const index = SIZE_ORDER.indexOf(size as (typeof SIZE_ORDER)[number]);
  return index === -1 ? SIZE_ORDER.length : index;
}

function groupBy<T, K>(rows: T[], key: (row: T) => K) {
  const map = new Map<K, T[]>();
  for (const row of rows) {
    const group = map.get(key(row));
    if (group) group.push(row);
    else map.set(key(row), [row]);
  }
  return map;
}

export const getCatalogue = cache(async (): Promise<Catalogue> => {
  const supabase = createPublicClient();

  const results = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_colours")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase.from("product_variants").select("*").eq("is_active", true),
    supabase
      .from("collections")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase.from("product_collections").select("*"),
  ]);

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    throw new Error(`Catalogue query failed: ${failed.error.message}`);
  }

  const [productsResult, coloursResult, variantsResult, collectionsResult, linksResult] = results;

  const products: Product[] = productsResult.data ?? [];
  const colours: ProductColour[] = coloursResult.data ?? [];
  const variants: ProductVariant[] = variantsResult.data ?? [];
  const collections: Collection[] = collectionsResult.data ?? [];
  const links = linksResult.data ?? [];

  const coloursByProduct = groupBy(colours, (colour) => colour.product_id);
  const variantsByColour = groupBy(variants, (variant) => variant.colour_id);
  const linksByProduct = groupBy(links, (link) => link.product_id);
  const collectionById = new Map(collections.map((collection) => [collection.id, collection]));

  const catalogueProducts: CatalogueProduct[] = products.map((product) => {
    const productColours: CatalogueColour[] = (coloursByProduct.get(product.id) ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((colour) => {
        const colourVariants = (variantsByColour.get(colour.id) ?? [])
          .slice()
          .sort((a, b) => sizeRank(a.size) - sizeRank(b.size));

        const sizes = colourVariants.map((variant) => ({
          variantId: variant.id,
          sku: variant.sku,
          size: variant.size,
          stock: variant.stock_quantity,
          inStock: variant.stock_quantity > 0,
        }));

        const frontImage = mediaUrl(colour.front_image_path);
        const backImage = mediaUrl(colour.back_image_path);
        const gallery = unique([
          colour.front_image_path,
          colour.back_image_path,
          ...colour.gallery_paths,
        ]).map((path) => mediaUrl(path) as string);

        const stock = sizes.reduce((total, size) => total + size.stock, 0);

        return {
          id: colour.id,
          slug: colour.slug,
          name: colour.name,
          hex: colour.hex,
          gallery,
          frontImage,
          backImage,
          sizes,
          stock,
          inStock: stock > 0,
        };
      });

    const availableColours = productColours.filter((colour) => colour.inStock);
    const defaultColour = availableColours[0] ?? productColours[0] ?? null;

    const collectionSlugs = (linksByProduct.get(product.id) ?? [])
      .map((link) => collectionById.get(link.collection_id))
      .filter((collection): collection is Collection => Boolean(collection))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((collection) => collection.slug);

    const totalStock = productColours.reduce((total, colour) => total + colour.stock, 0);

    const sizes = unique(
      availableColours.flatMap((colour) =>
        colour.sizes.filter((size) => size.inStock).map((size) => size.size),
      ),
    ).sort((a, b) => sizeRank(a) - sizeRank(b)) as CatalogueProduct["sizes"];

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      details: product.details ?? [],
      priceCents: product.price_cents,
      compareAtPriceCents: product.compare_at_price_cents,
      productType: product.product_type,
      isFeatured: product.is_featured,
      sortOrder: product.sort_order,
      updatedAt: product.updated_at,
      collectionSlugs,
      colours: productColours,
      totalStock,
      sizes,
      images: {
        front: defaultColour?.frontImage ?? null,
        back: defaultColour?.backImage ?? null,
      },
      defaultColourId: defaultColour?.id ?? null,
      isLowStock: totalStock > 0 && totalStock <= LOW_STOCK_THRESHOLD,
    };
  });

  const catalogueCollections: CatalogueCollection[] = collections.map((collection) => {
    const collectionProducts = catalogueProducts.filter((product) =>
      product.collectionSlugs.includes(collection.slug),
    );
    const fallbackImage = collectionProducts.find((product) => product.images.front)?.images.front;

    return {
      id: collection.id,
      slug: collection.slug,
      name: collection.name,
      description: collection.description,
      image: mediaUrl(collection.image_path) ?? fallbackImage ?? null,
      sortOrder: collection.sort_order,
      productCount: collectionProducts.length,
    };
  });

  return { products: catalogueProducts, collections: catalogueCollections };
});

export async function getProductBySlug(slug: string): Promise<CatalogueProduct | null> {
  const { products } = await getCatalogue();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getCollectionBySlug(slug: string): Promise<CatalogueCollection | null> {
  const { collections } = await getCatalogue();
  return collections.find((collection) => collection.slug === slug) ?? null;
}

export async function getFeaturedProducts(limit = 4): Promise<CatalogueProduct[]> {
  const { products } = await getCatalogue();
  return products
    .filter((product) => product.isFeatured)
    .slice(0, limit);
}

export function getRelatedProducts(
  product: CatalogueProduct,
  products: CatalogueProduct[],
  limit = 4,
): CatalogueProduct[] {
  const collection = product.collectionSlugs[0];

  const related = products.filter(
    (candidate) =>
      candidate.id !== product.id &&
      (!collection || candidate.collectionSlugs.includes(collection)),
  );

  const pool = related.length >= limit ? related : products;
  return pool.filter((candidate) => candidate.id !== product.id).slice(0, limit);
}
