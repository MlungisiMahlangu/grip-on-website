"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Heart, MessageCircle, Phone, Search, X } from "lucide-react";
import { COLLECTIONS, NAV_ITEMS, SITE } from "@/lib/site";
import { phoneFromLocal } from "@/lib/business";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { useWishlistStore } from "@/store/wishlist";
import { useDialog } from "@/hooks/use-dialog";
import { useStorefrontSettings } from "@/components/providers/storefront-settings-provider";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonClasses } from "@/components/ui/button";

export function MobileMenu() {
  const pathname = usePathname();
  const { contactEmail, contactPhone, instagram } = useStorefrontSettings();
  const phone = phoneFromLocal(contactPhone);
  const menuOpen = useUIStore((state) => state.menuOpen);
  const closeMenu = useUIStore((state) => state.closeMenu);
  const openCart = useUIStore((state) => state.openCart);
  const hydrated = useHydrated();
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const wishlistCount = useWishlistStore((state) => state.slugs.length);

  const close = useCallback(() => closeMenu(), [closeMenu]);
  const dialogRef = useDialog<HTMLDivElement>(menuOpen, close);

  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    closeMenu();
  }, [pathname, closeMenu]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-ink" />
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.22, 0.7, 0.2, 1] }}
              className="relative flex h-full flex-col"
            >
              <div className="flex h-16 items-center justify-between border-b border-line px-4">
                <Wordmark className="h-5" />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-card)] text-bone transition-colors hover:text-accent"
                >
                  <X className="h-5 w-5" strokeWidth={1.7} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6">
                <nav aria-label="Mobile" className="space-y-1">
                  {NAV_ITEMS.map((item) =>
                    item.mega ? null : (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={close}
                        className="display flex min-h-14 items-center justify-between border-b border-line text-h2"
                      >
                        {item.label}
                        <ArrowUpRight className="h-5 w-5 text-bone-dim" />
                      </Link>
                    ),
                  )}
                </nav>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link
                    href="/search"
                    onClick={close}
                    className="flex min-h-12 items-center gap-2 rounded-[var(--radius-card)] border border-line px-4 font-mono text-[10px] uppercase tracking-[0.16em] text-bone/80 transition-colors hover:border-bone/40 hover:text-bone"
                  >
                    <Search className="h-4 w-4" strokeWidth={1.7} />
                    Search
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={close}
                    className="flex min-h-12 items-center gap-2 rounded-[var(--radius-card)] border border-line px-4 font-mono text-[10px] uppercase tracking-[0.16em] text-bone/80 transition-colors hover:border-bone/40 hover:text-bone"
                  >
                    <Heart className="h-4 w-4" strokeWidth={1.7} />
                    Wishlist
                    {hydrated && wishlistCount > 0 ? (
                      <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold text-accent-ink">
                        {wishlistCount}
                      </span>
                    ) : null}
                  </Link>
                </div>

                <div className="mt-8">
                  <p className="eyebrow text-bone-dim">Collections</p>
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1">
                    {COLLECTIONS.map((collection) => (
                      <Link
                        key={collection.slug}
                        href={`/collections/${collection.slug}`}
                        onClick={close}
                        className="flex min-h-11 items-center text-sm text-bone/80 transition-colors hover:text-accent"
                      >
                        {collection.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-10 grid gap-3">
                  <button type="button" onClick={openCart} className={buttonClasses("primary")}>
                    View bag{hydrated && cartCount > 0 ? ` (${cartCount})` : ""} <ArrowRight />
                  </button>
                  <a
                    href={instagram ?? SITE.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonClasses("secondary")}
                  >
                    Instagram <ArrowUpRight />
                  </a>
                </div>

                <div className="mt-10 border-t border-line pb-8 pt-6">
                  <p className="eyebrow text-bone-dim">Need a hand?</p>
                  <div className="mt-3 grid gap-1">
                    <a
                      href={phone.tel}
                      className="inline-flex min-h-11 items-center gap-2.5 text-sm text-bone transition-colors hover:text-accent"
                    >
                      <Phone
                        className="h-4 w-4 text-bone-dim"
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                      Call {phone.display}
                    </a>
                    <a
                      href={phone.whatsapp("Hi Grip On, I have a question about...")}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-2.5 text-sm text-bone transition-colors hover:text-accent"
                    >
                      <MessageCircle
                        className="h-4 w-4 text-bone-dim"
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                      WhatsApp
                    </a>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex min-h-11 items-center gap-2.5 text-sm text-bone transition-colors hover:text-accent"
                    >
                      <span
                        className="w-4 text-center font-mono text-[9px] text-bone-dim"
                        aria-hidden="true"
                      >
                        @
                      </span>
                      {contactEmail}
                    </a>
                  </div>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-dim">
                    {SITE.location}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}
