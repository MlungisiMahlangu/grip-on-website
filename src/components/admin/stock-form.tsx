"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { saveStockAction, type StockState } from "@/lib/admin/inventory-actions";
import { cn } from "@/lib/utils";

const initialState: StockState = {};

export function StockForm({
  variantId,
  stock,
  label,
}: {
  variantId: string;
  stock: number;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(saveStockAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-1.5">
        <input type="hidden" name="variantId" value={variantId} />
        <input
          type="number"
          name="stock"
          min={0}
          max={100000}
          step={1}
          defaultValue={stock}
          aria-label={`Stock for ${label}`}
          className={cn(
            "min-h-11 w-20 rounded-[var(--radius-card)] border bg-ink px-2 text-center font-mono text-sm text-bone focus:border-accent focus:outline-none",
            stock === 0 ? "border-red-400/40" : stock <= 5 ? "border-accent/40" : "border-line",
          )}
        />
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] border border-line text-bone-dim transition-colors hover:border-bone hover:text-bone disabled:opacity-50"
          aria-label={`Save stock for ${label}`}
          title="Save stock"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {state.error ? (
        <p role="alert" className="max-w-[16rem] text-[11px] leading-snug text-red-400">
          {state.error}
        </p>
      ) : state.success ? (
        <p role="status" className="text-[11px] text-emerald-300">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
