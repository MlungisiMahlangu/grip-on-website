import type { Metadata } from "next";
import { getCatalogue } from "@/lib/catalogue/queries";
import { firstValue, type CatalogueSearchParams } from "@/lib/catalogue/params";
import type { SearchResult } from "@/hooks/use-product-search";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { SearchExplorer } from "@/components/search/search-explorer";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Grip On range.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<CatalogueSearchParams>;
}) {
  const params = await searchParams;
  const query = (firstValue(params.q) ?? "").trim().slice(0, 80);
  const { products } = await getCatalogue();

  const suggestions: SearchResult[] = products
    .filter((product) => product.isFeatured)
    .slice(0, 4)
    .map((product) => ({
      slug: product.slug,
      name: product.name,
      type: product.productType,
      priceCents: product.priceCents,
      image: product.images.front,
    }));

  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-8 pt-8 sm:pt-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />

          <div className="mt-5">
            <p className="eyebrow text-accent">Search the range</p>
            <h1 className="display mt-3 text-h2">
              Find your fit<span className="text-accent">.</span>
            </h1>
          </div>
        </div>
      </section>

      <div className="container-x section-y">
        <SearchExplorer initialQuery={query} suggestions={suggestions} />
      </div>
    </div>
  );
}
