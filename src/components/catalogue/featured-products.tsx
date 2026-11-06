import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedProducts } from "@/lib/catalogue/queries";
import type { CatalogueProduct } from "@/lib/catalogue/types";
import { ProductGrid } from "@/components/catalogue/product-grid";
import { buttonClasses } from "@/components/ui/button";

export async function FeaturedProducts() {
  let products: CatalogueProduct[];

  try {
    products = await getFeaturedProducts(4);
  } catch {
    return null;
  }

  if (products.length === 0) return null;

  return (
    <section className="border-b border-line bg-ink section-y">
      <div className="container-x">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-accent">New gear</p>
            <h2 className="display mt-3 text-h2">
              The core range<span className="text-accent">.</span>
            </h2>
          </div>
          <Link href="/shop" className={buttonClasses("secondary")}>
            Shop the range <ArrowRight />
          </Link>
        </div>

        <div className="mt-9 sm:mt-12">
          <ProductGrid products={products} priorityCount={2} />
        </div>
      </div>
    </section>
  );
}
