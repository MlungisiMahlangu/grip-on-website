import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div aria-busy="true">
      <div className="mb-7 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24 rounded-none" />
          <Skeleton className="h-10 w-56 rounded-none sm:h-12" />
          <Skeleton className="h-4 w-72 max-w-full rounded-none" />
        </div>
        <Skeleton className="h-9 w-28 rounded-none" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-[var(--radius-card)]" />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <Skeleton className="h-80 rounded-[var(--radius-card)] xl:col-span-8" />
        <Skeleton className="h-80 rounded-[var(--radius-card)] xl:col-span-4" />
      </div>
    </div>
  );
}
