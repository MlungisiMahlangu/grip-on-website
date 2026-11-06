import { ProductGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-8 pt-8 sm:pt-12">
          <Skeleton className="h-3 w-28 rounded-none" />
          <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="space-y-3 lg:col-span-7">
              <Skeleton className="h-3 w-24 rounded-none" />
              <Skeleton className="h-12 w-56 rounded-none sm:h-14 sm:w-72" />
            </div>
            <div className="lg:col-span-5">
              <Skeleton className="h-12 w-full rounded-none" />
            </div>
          </div>
        </div>
      </section>

      <div className="container-x py-9 sm:py-12">
        <Skeleton className="h-3 w-40 rounded-none" />
        <div className="mt-7">
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
