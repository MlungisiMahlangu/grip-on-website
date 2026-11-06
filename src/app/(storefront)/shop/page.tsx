import type { Metadata } from "next";
import { getCatalogue } from "@/lib/catalogue/queries";
import { filterProducts } from "@/lib/catalogue/filter";
import {
  parseLimit,
  parseSort,
  type CatalogueSearchParams,
} from "@/lib/catalogue/params";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CategoryNav } from "@/components/catalogue/category-nav";
import { EmptyResults } from "@/components/catalogue/empty-results";
import { FilterBar } from "@/components/catalogue/filter-bar";
import { LoadMore } from "@/components/catalogue/load-more";
import { ProductGrid } from "@/components/catalogue/product-grid";

export const metadata: Metadata = {
  title: "Shop all",
  description:
    "Tees, hoodies, tanks, shorts and training accessories. Built for the work and delivered across South Africa.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<CatalogueSearchParams>;
}) {
  const params = await searchParams;
  const { products, collections } = await getCatalogue();

  const results = filterProducts(products, {
    sort: parseSort(params.sort),
  });
  const limit = parseLimit(params.limit);
  const visible = results.slice(0, limit);

  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-6 pt-7 sm:pt-9">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-accent">
                The range / {products.length} {products.length === 1 ? "piece" : "pieces"}
              </p>
              <h1 className="display mt-2 text-h2">
                Shop all<span className="text-accent">.</span>
              </h1>
            </div>
            <p className="max-w-md text-caption leading-relaxed text-bone-dim">
              Cut for training, finished in small runs and priced to be worn hard.
            </p>
          </div>

          <div className="mt-5">
            <CategoryNav collections={collections} />
          </div>
        </div>
      </section>

      <div className="container-x pb-[var(--space-section)] pt-6">
        <FilterBar basePath="/shop" params={params} resultCount={results.length} />

        <div className="mt-6 sm:mt-8">
          {visible.length > 0 ? (
            <>
              <ProductGrid products={visible} priorityCount={2} />
              <LoadMore
                basePath="/shop"
                params={params}
                shown={visible.length}
                total={results.length}
              />
            </>
          ) : (
            <EmptyResults href="/shop" label="Shop all" />
          )}
        </div>
      </div>
    </div>
  );
}
