import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalogue, getCollectionBySlug } from "@/lib/catalogue/queries";
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

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) notFound();

  return {
    title: collection.name,
    description: collection.description ?? `Shop the ${collection.name} collection at Grip On.`,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: collection.image
      ? { images: [{ url: collection.image, alt: collection.name }] }
      : undefined,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogueSearchParams>;
}) {
  const [{ slug }, filters] = await Promise.all([params, searchParams]);
  const [{ products, collections }, collection] = await Promise.all([
    getCatalogue(),
    getCollectionBySlug(slug),
  ]);

  if (!collection) notFound();

  const basePath = `/collections/${collection.slug}`;
  const results = filterProducts(products, {
    collection: collection.slug,
    sort: parseSort(filters.sort),
  });
  const limit = parseLimit(filters.limit);
  const visible = results.slice(0, limit);

  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-6 pt-7 sm:pt-9">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              { label: collection.name },
            ]}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-accent">
                Collection / {collection.productCount}{" "}
                {collection.productCount === 1 ? "piece" : "pieces"}
              </p>
              <h1 className="display mt-2 text-h2">
                {collection.name}
                <span className="text-accent">.</span>
              </h1>
            </div>
            <p className="max-w-md text-caption leading-relaxed text-bone-dim">
              {collection.description ?? "The latest from the Grip On range."}
            </p>
          </div>

          <div className="mt-5">
            <CategoryNav collections={collections} activeSlug={collection.slug} />
          </div>
        </div>
      </section>

      <div className="container-x pb-[var(--space-section)] pt-6">
        <FilterBar basePath={basePath} params={filters} resultCount={results.length} />

        <div className="mt-6 sm:mt-8">
          {visible.length > 0 ? (
            <>
              <ProductGrid products={visible} priorityCount={2} />
              <LoadMore
                basePath={basePath}
                params={filters}
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
