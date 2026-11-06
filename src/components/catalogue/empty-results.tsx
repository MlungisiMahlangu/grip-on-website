import Link from "next/link";
import { LifterMark } from "@/components/brand/lifter-mark";
import { buttonClasses } from "@/components/ui/button";

export function EmptyResults({
  href = "/shop",
  label = "Shop all",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line px-6 py-16 text-center">
      <LifterMark className="mx-auto h-10 opacity-40" />
      <h2 className="display mt-5 text-h3">Nothing here yet.</h2>
      <p className="mx-auto mt-3 max-w-sm text-body leading-relaxed text-bone-dim">
        There is nothing to show right now. The rest of the range is still here.
      </p>
      <Link href={href} className={buttonClasses("secondary", "mt-7")}>
        {label}
      </Link>
    </div>
  );
}
