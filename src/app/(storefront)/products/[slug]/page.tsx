import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { getCatalogue, getRelatedProducts } from "@/lib/catalogue/queries";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { ProductGrid } from "@/components/catalogue/product-grid";
import { ProductView } from "@/components/catalogue/product-view";
import { buttonClasses } from "@/components/ui/button";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { products } = await getCatalogue();
    return products.map((product) => ({ slug: product.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getCatalogue();
  const product = products.find((entry) => entry.slug === slug);

  if (!product) return { title: "Product not found" };

  const description =
    product.description ?? product.tagline ?? `Shop the ${product.name} at Grip On.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: product.images.front
      ? {
          title: product.name,
          description,
          images: [{ url: product.images.front, alt: product.name }],
        }
      : { title: product.name, description },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { products } = await getCatalogue();
  const product = products.find((entry) => entry.slug === slug);

  if (!product) notFound();

  const related = getRelatedProducts(product, products, 4);
  const variantCount = product.colours.reduce((total, colour) => total + colour.sizes.length, 0);
  const price = (product.priceCents / 100).toFixed(2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.tagline ?? undefined,
    image: [...new Set(product.colours.flatMap((colour) => colour.gallery))].slice(0, 6),
    brand: { "@type": "Brand", name: SITE.name },
    category: product.productType,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "ZAR",
      lowPrice: price,
      highPrice: price,
      offerCount: variantCount,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE.url}/products/${product.slug}`,
    },
  };

  return (
    <>
      <div className="bg-ink">
        <div className="container-x pt-6 sm:pt-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              { label: product.name },
            ]}
          />
        </div>

        <div className="container-x pb-12 pt-6 sm:pb-16 sm:pt-8">
          <ProductView product={product} />
        </div>
      </div>

      {related.length > 0 ? (
        <section className="border-t border-line bg-ink">
          <div className="container-x py-14 sm:py-20">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-accent">From the same range</p>
                <h2 className="display mt-3 text-[clamp(2.5rem,6vw,4.5rem)]">
                  More for the work.
                </h2>
              </div>
              <Link href="/shop" className={buttonClasses("secondary")}>
                Shop all <ArrowRight />
              </Link>
            </div>

            <div className="mt-8">
              <ProductGrid products={related} />
            </div>
          </div>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
