import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCatalogue } from "@/lib/catalogue/queries";
import { filterProducts } from "@/lib/catalogue/filter";
import { firstValue, type CatalogueSearchParams } from "@/lib/catalogue/params";
import { LifterMark } from "@/components/brand/lifter-mark";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { ProductGrid } from "@/components/catalogue/product-grid";
import { SearchForm } from "@/components/catalogue/search-form";
import { buttonClasses } from "@/components/ui/button";

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
  const query = (firstValue(params.q) ?? "").trim();
  const { products } = await getCatalogue();

  const results = query ? filterProducts(products, { query }) : [];
  const suggestions = products.filter((product) => product.isFeatured).slice(0, 4);

  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-9 pt-8 sm:pt-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />

          <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow text-accent">Search the range</p>
              <h1 className="display mt-3 text-[clamp(3.5rem,10vw,8rem)]">
                Find your
                <br />
                fit<span className="text-accent">.</span>
              </h1>
            </div>
            <div className="lg:col-span-5">
              <SearchForm defaultValue={query} />
            </div>
          </div>
        </div>
      </section>

      <div className="container-x py-9 sm:py-12">
        {query ? (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-dim">
                {results.length} {results.length === 1 ? "result" : "results"} for
              </p>
              <p className="text-sm text-bone">“{query}”</p>
            </div>

            <div className="mt-7">
              {results.length > 0 ? (
                <ProductGrid products={results} priorityCount={2} />
              ) : (
                <div className="rounded-[var(--radius-card)] border border-line px-6 py-16 text-center">
                  <LifterMark className="mx-auto h-10 opacity-40" />
                  <h2 className="display mt-5 text-3xl">No matches.</h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-bone-dim">
                    Nothing turned up for that search. Try a different word or browse the full
                    range.
                  </p>
                  <Link href="/shop" className={buttonClasses("secondary", "mt-7")}>
                    Shop all <ArrowRight />
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-bone-dim">Start here</p>
                <h2 className="display mt-2 text-4xl sm:text-5xl">The pieces we build around.</h2>
              </div>
              <Link href="/shop" className={buttonClasses("secondary")}>
                Shop all <ArrowRight />
              </Link>
            </div>

            <div className="mt-8">
              <ProductGrid products={suggestions} priorityCount={2} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
