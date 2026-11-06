"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useHydrated } from "@/hooks/use-hydrated";
import { useWishlistStore } from "@/store/wishlist";

export function WishlistButton({
  slug,
  name,
  className,
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const saved = useWishlistStore((state) => state.slugs.includes(slug));
  const toggle = useWishlistStore((state) => state.toggle);
  const hydrated = useHydrated();
  const active = hydrated && saved;

  return (
    <button
      type="button"
      aria-label={active ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(slug);
        toast.success(active ? `${name} removed from your wishlist.` : `${name} saved to your wishlist.`);
      }}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full border border-bone/15 bg-ink/70 text-bone backdrop-blur-sm transition-colors hover:border-bone/40 hover:text-accent",
        active && "border-accent/60 text-accent",
        className,
      )}
    >
      <Heart
        className={cn("h-[18px] w-[18px]", active && "fill-current")}
        strokeWidth={1.7}
      />
    </button>
  );
}
