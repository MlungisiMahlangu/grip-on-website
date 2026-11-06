"use client";

import { AlertTriangle } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60svh] flex-col items-start justify-center">
      <AlertTriangle className="h-8 w-8 text-accent" aria-hidden="true" />
      <p className="eyebrow mt-5 text-accent">Admin error</p>
      <h1 className="display mt-3 text-h2">That did not load.</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-bone-dim">
        The dashboard could not fetch what it needed. Try again. If it keeps failing, check the
        Supabase connection and that the Phase 5 migration has been applied.
      </p>
      <button type="button" onClick={reset} className={buttonClasses("primary", "mt-7")}>
        Try again
      </button>
    </div>
  );
}
