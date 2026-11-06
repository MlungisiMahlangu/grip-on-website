import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="bg-ink">
      <div className="container-x pt-6 sm:pt-8">
        <Skeleton className="h-3 w-48 rounded-none" />
      </div>

      <div className="container-x pb-12 pt-6 sm:pb-16 sm:pt-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-3 lg:col-span-7">
            <Skeleton className="aspect-[4/5] w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-16 w-16" />
              <Skeleton className="h-16 w-16" />
              <Skeleton className="h-16 w-16" />
            </div>
          </div>

          <div className="space-y-5 lg:col-span-5">
            <Skeleton className="h-3 w-24 rounded-none" />
            <Skeleton className="h-10 w-3/4 rounded-none sm:h-12" />
            <Skeleton className="h-5 w-28 rounded-none" />
            <Skeleton className="h-4 w-full rounded-none" />
            <Skeleton className="h-4 w-5/6 rounded-none" />
            <div className="space-y-3 pt-4">
              <Skeleton className="h-3 w-16 rounded-none" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }, (_, index) => (
                  <Skeleton key={index} className="h-11 w-11 rounded-none" />
                ))}
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
