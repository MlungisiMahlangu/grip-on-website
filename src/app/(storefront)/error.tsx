"use client";

import Link from "next/link";
import { LifterMark } from "@/components/brand/lifter-mark";
import { buttonClasses } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-x flex min-h-[70svh] flex-col items-center justify-center py-20 text-center">
      <LifterMark className="h-14 opacity-60" />
      <p className="eyebrow mt-6 text-accent">Something went wrong</p>
      <h1 className="display mt-4 text-hero">The bar slipped.</h1>
      <p className="mt-4 max-w-md text-body leading-relaxed text-bone-dim">
        That was not meant to happen. Try again, or head back to the floor.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className={buttonClasses("primary")}>
          Try again
        </button>
        <Link href="/" className={buttonClasses("secondary")}>
          Back home
        </Link>
      </div>
    </div>
  );
}
