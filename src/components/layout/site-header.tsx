"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, Menu, Search, ShoppingBag } from "lucide-react";
import { NAV_ITEMS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { useWishlistStore } from "@/store/wishlist";
import { Wordmark } from "@/components/brand/wordmark";
import { MegaMenu } from "@/components/layout/mega-menu";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const openCart = useUIStore((state) => state.openCart);
  const openMenu = useUIStore((state) => state.openMenu);
  const hydrated = useHydrated();
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const wishlistCount = useWishlistStore((state) => state.slugs.length);

  const solid = scrolled || pathname !== "/" || megaOpen;
  const bagLabel =
    hydrated && cartCount > 0
      ? `Open bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`
      : "Open bag";
  const wishlistLabel =
    hydrated && wishlistCount > 0 ? `Wishlist, ${wishlistCount} saved` : "Wishlist";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!megaOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMegaOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMegaOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [megaOpen]);

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        solid
          ? "border-b border-line bg-ink/90 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        className={cn(
          "container-x flex items-center justify-between gap-4 transition-[height] duration-300",
          scrolled ? "h-14 lg:h-16" : "h-16 lg:h-20",
        )}
      >
        <Wordmark className="h-5 sm:h-6" priority onClick={() => setMegaOpen(false)} />

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map((item) =>
            item.mega ? (
              <button
                key={item.label}
                type="button"
                onClick={() => setMegaOpen((value) => !value)}
                aria-expanded={megaOpen}
                aria-controls="mega-menu"
                aria-haspopup="true"
                className="inline-flex min-h-11 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-bone/80 transition-colors hover:text-bone"
              >
                {item.label}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    megaOpen && "rotate-180",
                  )}
                />
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMegaOpen(false)}
                className="inline-flex min-h-11 items-center font-mono text-[11px] uppercase tracking-[0.18em] text-bone/80 transition-colors hover:text-bone"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-card)] text-bone transition-colors hover:text-accent"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.7} />
          </Link>

          <span className="relative inline-flex">
            <Link
              href="/wishlist"
              aria-label={wishlistLabel}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-card)] text-bone transition-colors hover:text-accent"
            >
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.7} />
            </Link>
            {hydrated && wishlistCount > 0 ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] font-semibold leading-none text-accent-ink"
              >
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            ) : null}
          </span>

          <span className="relative inline-flex">
            <button
              type="button"
              onClick={openCart}
              aria-label={bagLabel}
              className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--radius-card)] px-2.5 text-bone transition-colors hover:text-accent"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.7} />
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] sm:inline">
                Bag
              </span>
            </button>
            {hydrated && cartCount > 0 ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] font-semibold leading-none text-accent-ink"
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            ) : null}
          </span>

          <button
            type="button"
            onClick={openMenu}
            aria-label="Open menu"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-card)] text-bone transition-colors hover:text-accent lg:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.7} />
          </button>
        </div>
      </div>

      <MegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} />
    </header>
  );
}
