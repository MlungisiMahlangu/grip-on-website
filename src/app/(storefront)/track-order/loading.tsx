import { Skeleton } from "@/components/ui/skeleton";

export default function TrackOrderLoading() {
  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-8 pt-8 sm:pt-12">
          <Skeleton className="h-3 w-32 rounded-none" />
          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-3 w-24 rounded-none" />
              <Skeleton className="h-12 w-48 rounded-none sm:h-14 sm:w-60" />
            </div>
            <Skeleton className="h-12 w-full max-w-sm rounded-none" />
          </div>
        </div>
      </section>

      <div className="container-x py-8 sm:py-10">
        <Skeleton className="h-64 w-full max-w-2xl rounded-[var(--radius-card)]" />
        <Skeleton className="mt-8 h-40 w-full max-w-2xl rounded-[var(--radius-card)]" />
      </div>
    </div>
  );
}
