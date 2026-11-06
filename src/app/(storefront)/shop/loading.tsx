import { PageHeaderSkeleton, ProductGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="bg-ink">
      <PageHeaderSkeleton />
      <div className="container-x py-8 sm:py-10">
        <Skeleton className="h-12 w-full rounded-none" />
        <div className="mt-8 sm:mt-10">
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
