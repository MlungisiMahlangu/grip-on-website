import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-bone-dim">
        {items.map((item, index) => {
          const last = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-0.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center transition-colors hover:text-bone"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current="page"
                  className="inline-flex min-h-11 items-center px-1 text-bone/80"
                >
                  {item.label}
                </span>
              )}
              {!last ? <span aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
