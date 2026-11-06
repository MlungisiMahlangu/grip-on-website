import { getCatalogue } from "@/lib/catalogue/queries";
import { SIZE_LABELS } from "@/lib/catalogue/types";
import type { ProductType } from "@/lib/supabase/types";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

const GOOGLE_CATEGORY: Record<ProductType, string> = {
  tee: "Apparel & Accessories > Clothing > Shirts & Tops",
  hoodie: "Apparel & Accessories > Clothing > Shirts & Tops",
  tank: "Apparel & Accessories > Clothing > Shirts & Tops",
  bottoms: "Apparel & Accessories > Clothing > Shorts",
  accessory: "Apparel & Accessories > Clothing Accessories",
};

const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  tee: "Tees",
  hoodie: "Hoodies",
  tank: "Tanks",
  bottoms: "Bottoms",
  accessory: "Accessories",
};

function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
}

function clean(value: string, limit: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, limit);
}

function money(cents: number): string {
  return `${(cents / 100).toFixed(2)} ZAR`;
}

export async function GET() {
  const items: string[] = [];

  try {
    const { products } = await getCatalogue();

    for (const product of products) {
      const description = clean(
        product.description ?? product.tagline ?? `${product.name} from the Grip On range.`,
        5000,
      );
      const link = `${SITE.url}/products/${product.slug}`;
      const regularPriceCents =
        product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents
          ? product.compareAtPriceCents
          : product.priceCents;

      for (const colour of product.colours) {
        const image = colour.frontImage ?? colour.backImage ?? product.images.front;
        if (!image) continue;

        for (const size of colour.sizes) {
          const sizeLabel = SIZE_LABELS[size.size];
          const title = clean(`${product.name} — ${colour.name} / ${sizeLabel}`, 150);

          items.push(
            [
              "    <item>",
              `      <g:id>${xml(size.sku)}</g:id>`,
              `      <g:item_group_id>${xml(product.id)}</g:item_group_id>`,
              `      <g:title>${xml(title)}</g:title>`,
              `      <g:description>${xml(description)}</g:description>`,
              `      <g:link>${xml(link)}</g:link>`,
              `      <g:image_link>${xml(image)}</g:image_link>`,
              ...(colour.backImage && colour.backImage !== image
                ? [`      <g:additional_image_link>${xml(colour.backImage)}</g:additional_image_link>`]
                : []),
              `      <g:availability>${size.inStock ? "in stock" : "out of stock"}</g:availability>`,
              "      <g:condition>new</g:condition>",
              `      <g:price>${money(regularPriceCents)}</g:price>`,
              ...(regularPriceCents !== product.priceCents
                ? [`      <g:sale_price>${money(product.priceCents)}</g:sale_price>`]
                : []),
              `      <g:brand>${xml(SITE.name)}</g:brand>`,
              "      <g:gender>unisex</g:gender>",
              "      <g:age_group>adult</g:age_group>",
              `      <g:color>${xml(colour.name)}</g:color>`,
              `      <g:size>${xml(sizeLabel)}</g:size>`,
              `      <g:mpn>${xml(size.sku)}</g:mpn>`,
              `      <g:google_product_category>${xml(
                GOOGLE_CATEGORY[product.productType],
              )}</g:google_product_category>`,
              `      <g:product_type>${xml(
                `Gym Apparel > ${PRODUCT_TYPE_LABEL[product.productType]}`,
              )}</g:product_type>`,
              "    </item>",
            ].join("\n"),
          );
        }
      }
    }
  } catch {
    // The feed stays valid but empty while the database is unreachable.
  }

  const feed = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    "  <channel>",
    `    <title>${xml(`${SITE.name} — Product feed`)}</title>`,
    `    <link>${xml(SITE.url)}</link>`,
    `    <description>${xml(SITE.description)}</description>`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
