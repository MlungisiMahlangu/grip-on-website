import type { CatalogueProduct } from "@/lib/catalogue/types";
import { ProductCard } from "@/components/catalogue/product-card";

export function ProductGrid({
  products,
  priorityCount = 0,
}: {
  products: CatalogueProduct[];
  priorityCount?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  );
}
