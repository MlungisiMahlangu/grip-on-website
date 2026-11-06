import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalogue, getCollectionBySlug } from "@/lib/catalogue/queries";
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
    sizes: parseSizes(filters.sizes),
    colours: parseList(filters.colours),
    sort: parseSort(filters.sort),
  });

  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-8 pt-8 sm:pt-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              { label: collection.name },
            ]}
          />

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow text-accent">Collection</p>
              <h1 className="display mt-3 text-[clamp(3.5rem,10vw,8rem)]">
                {collection.name}
                <span className="text-accent">.</span>
              </h1>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-bone-dim">
              {collection.description ?? "The latest from the Grip On range."}
            </p>
          </div>

          <div className="mt-8">
            <CategoryNav collections={collections} activeSlug={collection.slug} />
          </div>
        </div>
      </section>

      <div className="container-x py-8 sm:py-10">
        <FilterBar
          basePath={basePath}
          params={filters}
          sizes={getSizeOptions(products)}
          colours={getColourOptions(products)}
          resultCount={results.length}
        />

        <div className="mt-8 sm:mt-10">
          {results.length > 0 ? (
            <ProductGrid products={results} priorityCount={2} />
          ) : (
            <EmptyResults basePath={basePath} />
          )}
        </div>
      </div>
    </div>
  );
}
