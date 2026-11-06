import type { GarmentSize, ProductType } from "@/lib/supabase/types";

export type { GarmentSize, ProductType };

export const SIZE_ORDER: GarmentSize[] = ["XS", "S", "M", "L", "XL", "XXL", "ONE_SIZE"];

export const SIZE_LABELS: Record<GarmentSize, string> = {
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
  ONE_SIZE: "One size",
};

export const LOW_STOCK_THRESHOLD = 5;

export type CatalogueSize = {
  variantId: string;
  sku: string;
  size: GarmentSize;
  stock: number;
  inStock: boolean;
};

export type CatalogueColour = {
  id: string;
  slug: string;
  name: string;
  hex: string;
  gallery: string[];
  frontImage: string | null;
  backImage: string | null;
  sizes: CatalogueSize[];
  stock: number;
  inStock: boolean;
};

export type CatalogueProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  details: string[];
  priceCents: number;
  compareAtPriceCents: number | null;
  productType: ProductType;
  isFeatured: boolean;
  sortOrder: number;
  updatedAt: string;
  collectionSlugs: string[];
  colours: CatalogueColour[];
  totalStock: number;
  sizes: GarmentSize[];
  images: { front: string | null; back: string | null };
  defaultColourId: string | null;
  isLowStock: boolean;
};

export type CatalogueCollection = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  productCount: number;
};

export type Catalogue = {
  products: CatalogueProduct[];
  collections: CatalogueCollection[];
};

export type CatalogueSort = "featured" | "price-asc" | "price-desc";

export type CatalogueFilters = {
  collection?: string;
  sizes?: GarmentSize[];
  colours?: string[];
  query?: string;
  sort?: CatalogueSort;
};
