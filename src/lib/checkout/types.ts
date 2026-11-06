import type { GarmentSize } from "@/lib/catalogue/types";

export type CheckoutVariant = {
  variantId: string;
  productName: string;
  productSlug: string;
  colourName: string;
  size: GarmentSize;
  priceCents: number;
  stock: number;
  imageUrl: string | null;
};
