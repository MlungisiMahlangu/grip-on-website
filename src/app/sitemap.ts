import type { MetadataRoute } from "next";
import { getCatalogue } from "@/lib/catalogue/queries";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/shop", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/track-order", changeFrequency: "monthly", priority: 0.4 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/shipping-returns", changeFrequency: "monthly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms-of-sale", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE.url}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const { products, collections } = await getCatalogue();

    const collectionEntries: MetadataRoute.Sitemap = collections.map((collection) => ({
      url: `${SITE.url}/collections/${collection.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE.url}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticEntries, ...collectionEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
