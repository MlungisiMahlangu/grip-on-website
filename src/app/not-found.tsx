import Link from "next/link";
import { LifterMark } from "@/components/brand/lifter-mark";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <StorefrontShell>
      <div className="container-x flex min-h-[75svh] flex-col justify-center py-20">
        <LifterMark className="h-12 opacity-60" />
        <p className="eyebrow mt-6 text-accent">404</p>
        <h1 className="display mt-3 text-[clamp(4.5rem,16vw,13rem)]">
          Off the
          <br />
          bar<span className="text-accent">.</span>
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-bone-dim">
          This page is not in the gym. Check the address or get back to the range.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/" className={buttonClasses("primary")}>
            Back home
          </Link>
          <Link href="/shop" className={buttonClasses("secondary")}>
            Shop the range
          </Link>
        </div>
      </div>
    </StorefrontShell>
  );
}
