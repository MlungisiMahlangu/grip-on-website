import Link from "next/link";
import { LifterMark } from "@/components/brand/lifter-mark";
import { buttonClasses } from "@/components/ui/button";

export function EmptyResults({ basePath }: { basePath: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line px-6 py-16 text-center">
      <LifterMark className="mx-auto h-10 opacity-40" />
      <h2 className="display mt-5 text-3xl">Nothing matches.</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-bone-dim">
        Try a different size, colour or collection. The rest of the range is still here.
      </p>
      <Link href={basePath} className={buttonClasses("secondary", "mt-7")}>
        Clear filters
      </Link>
    </div>
  );
}
