import type { Metadata } from "next";
import { getCatalogue } from "@/lib/catalogue/queries";
import {
  filterProducts,
  getColourOptions,
  getSizeOptions,
} from "@/lib/catalogue/filter";
import {
  parseList,
  parseSizes,
  parseSort,
  type CatalogueSearchParams,
} from "@/lib/catalogue/params";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CategoryNav } from "@/components/catalogue/category-nav";
import { EmptyResults } from "@/components/catalogue/empty-results";
import { FilterBar } from "@/components/catalogue/filter-bar";
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
    sizes: parseSizes(params.sizes),
    colours: parseList(params.colours),
    sort: parseSort(params.sort),
  });

  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-8 pt-8 sm:pt-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow text-accent">The range</p>
              <h1 className="display mt-3 text-[clamp(3.5rem,10vw,8rem)]">
                Shop all<span className="text-accent">.</span>
              </h1>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-bone-dim">
              Every piece is cut for training, finished in small runs and priced to be worn hard.
              Find your fit below.
            </p>
          </div>

          <div className="mt-8">
            <CategoryNav collections={collections} />
          </div>
        </div>
      </section>

      <div className="container-x py-8 sm:py-10">
        <FilterBar
          basePath="/shop"
          params={params}
          sizes={getSizeOptions(products)}
          colours={getColourOptions(products)}
          resultCount={results.length}
        />

        <div className="mt-8 sm:mt-10">
          {results.length > 0 ? (
            <ProductGrid products={results} priorityCount={2} />
          ) : (
            <EmptyResults basePath="/shop" />
          )}
        </div>
      </div>
    </div>
  );
}
