import { cn, formatPriceCents } from "@/lib/utils";
import type { DiscountCode } from "@/lib/supabase/types";

export type DiscountState = "active" | "scheduled" | "expired" | "paused" | "redeemed";

const LABELS: Record<DiscountState, string> = {
  active: "Active",
  scheduled: "Scheduled",
  expired: "Expired",
  paused: "Paused",
  redeemed: "Fully redeemed",
};

const TONES: Record<DiscountState, string> = {
  active: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  scheduled: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  expired: "border-line-strong bg-bone/5 text-bone-dim",
  paused: "border-line-strong bg-bone/5 text-bone-dim",
  redeemed: "border-accent/40 bg-accent/10 text-accent",
};

export function discountState(discount: DiscountCode): DiscountState {
  if (!discount.is_active) return "paused";

  const now = Date.now();
  if (discount.starts_at && new Date(discount.starts_at).getTime() > now) return "scheduled";
  if (discount.ends_at && new Date(discount.ends_at).getTime() < now) return "expired";
  if (
    discount.max_redemptions !== null &&
    discount.times_redeemed >= discount.max_redemptions
  ) {
    return "redeemed";
  }

  return "active";
}

export function DiscountStatusBadge({ discount }: { discount: DiscountCode }) {
  const state = discountState(discount);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.14em]",
        TONES[state],
      )}
    >
      {LABELS[state]}
    </span>
  );
}

export function discountValueLabel(discount: DiscountCode) {
  return discount.kind === "percent" ? `${discount.value}%` : formatPriceCents(discount.value);
}
