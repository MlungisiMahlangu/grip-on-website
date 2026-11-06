import type { Metadata } from "next";
import { getCatalogue } from "@/lib/catalogue/queries";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { WishlistView } from "@/components/catalogue/wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "The Grip On pieces you have saved for later.",
  alternates: { canonical: "/wishlist" },
  robots: { index: false, follow: true },
};

export default async function WishlistPage() {
  const { products } = await getCatalogue();

  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-9 pt-8 sm:pt-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow text-accent">Saved for later</p>
              <h1 className="display mt-3 text-hero">
                Wishlist<span className="text-accent">.</span>
              </h1>
            </div>
            <p className="max-w-md text-body leading-relaxed text-bone-dim">
              Your saved pieces, kept on this device. Sizes and stock are shown on each product.
            </p>
          </div>
        </div>
      </section>

      <div className="container-x section-y">
        <WishlistView products={products} />
      </div>
    </div>
  );
}
