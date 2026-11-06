import Link from "next/link";
import {
  CATALOGUE_PAGE_SIZE,
  hrefWith,
  type CatalogueSearchParams,
} from "@/lib/catalogue/params";
import { buttonClasses } from "@/components/ui/button";

export function LoadMore({
  basePath,
  params,
  shown,
  total,
}: {
  basePath: string;
  params: CatalogueSearchParams;
  shown: number;
  total: number;
}) {
  if (shown >= total) return null;

  const hidden = total - shown;

  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <Link
        href={hrefWith(basePath, params, {
          limit: String(shown + CATALOGUE_PAGE_SIZE),
        })}
        className={buttonClasses("secondary", "min-w-44")}
        scroll={false}
      >
        Load more
      </Link>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim">
        Showing {shown} of {total} ({hidden} more)
      </p>
    </div>
  );
}
