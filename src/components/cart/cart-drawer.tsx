"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrowRight, Minus, Plus, Trash2, X } from "lucide-react";
import { MAX_ITEM_QUANTITY } from "@/lib/catalogue/types";
import { toast } from "@/lib/toast";
import { formatPriceCents } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { useDialog } from "@/hooks/use-dialog";
import { LifterMark } from "@/components/brand/lifter-mark";
import { useStorefrontSettings } from "@/components/providers/storefront-settings-provider";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function CartDrawer() {
  const cartOpen = useUIStore((state) => state.cartOpen);
  const closeCart = useUIStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const [confirmClear, setConfirmClear] = useState(false);
  const hydrated = useHydrated();

  const close = useCallback(() => closeCart(), [closeCart]);
  const dialogRef = useDialog<HTMLElement>(cartOpen, close);

  const count = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.priceCents * item.quantity, 0);
  const { freeDeliveryArea } = useStorefrontSettings();
  const showItems = hydrated && items.length > 0;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {cartOpen ? (
          <div className="fixed inset-0 z-50">
            <motion.button
              type="button"
              aria-label="Close bag"
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            />

            <motion.aside
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Shopping bag"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 0.7, 0.2, 1] }}
              className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-ink shadow-2xl"
            >
              <header className="flex h-16 items-center justify-between border-b border-line px-5">
                <div className="flex items-baseline gap-3">
                  <p className="eyebrow">Your bag</p>
                  {hydrated && count > 0 ? (
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">
                      {count} {count === 1 ? "item" : "items"}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close bag"
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-card)] text-bone transition-colors hover:text-accent"
                >
                  <X className="h-5 w-5" strokeWidth={1.7} />
                </button>
              </header>

              {!hydrated ? (
                <div className="flex flex-1 items-center justify-center">
                  <LifterMark className="animate-mark h-10 opacity-40" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                  <LifterMark className="h-14 opacity-50" />
                  <h2 className="display mt-6 text-h3">Your bag is empty</h2>
                  <p className="mt-3 max-w-xs text-body leading-relaxed text-bone-dim">
                    Add a piece to get started. Free delivery in {freeDeliveryArea}.
                  </p>
                  <Link
                    href="/shop"
                    onClick={close}
                    className={buttonClasses("primary", "mt-7 w-full max-w-xs")}
                  >
                    Shop the range <ArrowRight />
                  </Link>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto overscroll-contain px-5">
                  <div className="border-b border-line py-4">
                    <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-bone-dim">
                      Free delivery in {freeDeliveryArea}. Other areas are quoted before dispatch.
                    </p>
                  </div>

                  <ul className="divide-y divide-line">
                    {items.map((item) => {
                      const sizeLabel = item.size === "ONE_SIZE" ? "One size" : item.size;

                      return (
                        <li key={item.key} className="flex gap-4 py-4">
                          <Link
                            href={`/products/${item.productSlug}`}
                            onClick={close}
                            aria-label={`View ${item.productName}`}
                            className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-soft"
                          >
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt=""
                                aria-hidden="true"
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex h-full items-center justify-center">
                                <LifterMark className="h-8 opacity-30" />
                              </span>
                            )}
                          </Link>

                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <Link
                                href={`/products/${item.productSlug}`}
                                onClick={close}
                                className="text-sm font-semibold uppercase tracking-[0.04em] text-bone transition-colors hover:text-accent"
                              >
                                {item.productName}
                              </Link>
                              <p className="shrink-0 font-mono text-xs text-bone">
                                {formatPriceCents(item.priceCents * item.quantity)}
                              </p>
                            </div>
                            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-bone-dim">
                              {item.colourName} · {sizeLabel}
                            </p>

                            <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                              <div className="flex items-center rounded-[var(--radius-card)] border border-line">
                                <button
                                  type="button"
                                  onClick={() => setQuantity(item.key, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  aria-label={`Decrease quantity of ${item.productName}`}
                                  className="flex h-11 w-11 items-center justify-center text-bone transition-colors hover:text-accent disabled:opacity-30"
                                >
                                  <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                                </button>
                                <span
                                  aria-live="polite"
                                  className="w-8 text-center font-mono text-xs text-bone"
                                >
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setQuantity(item.key, item.quantity + 1)}
                                  disabled={item.quantity >= MAX_ITEM_QUANTITY}
                                  aria-label={`Increase quantity of ${item.productName}`}
                                  className="flex h-11 w-11 items-center justify-center text-bone transition-colors hover:text-accent disabled:opacity-30"
                                >
                                  <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeItem(item.key)}
                                aria-label={`Remove ${item.productName} from bag`}
                                className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] text-bone-dim transition-colors hover:text-accent"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={1.7} />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <footer className="border-t border-line px-5 py-5">
                {showItems ? (
                  <>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-bone-dim">Subtotal</span>
                      <span className="font-mono text-base text-bone">
                        {formatPriceCents(subtotal)}
                      </span>
                    </div>
                    <p className="mt-1.5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-bone-dim">
                      Cash on delivery · Delivered across South Africa
                    </p>
                    <Link
                      href="/checkout"
                      onClick={close}
                      className={buttonClasses("primary", "mt-4 w-full")}
                    >
                      Checkout · {formatPriceCents(subtotal)} <ArrowRight />
                    </Link>
                    <button
                      type="button"
                      onClick={close}
                      className={buttonClasses("secondary", "mt-2 w-full")}
                    >
                      Keep shopping
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(true)}
                      className="mx-auto mt-3 flex min-h-11 items-center justify-center px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim transition-colors hover:text-red-300"
                    >
                      Clear bag
                    </button>
                  </>
                ) : (
                  <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-bone-dim">
                    Cash on delivery · Delivered across South Africa
                  </p>
                )}
              </footer>
            </motion.aside>

            <ConfirmDialog
              open={confirmClear}
              onClose={() => setConfirmClear(false)}
              onConfirm={() => {
                clear();
                setConfirmClear(false);
                toast.success("Your bag has been cleared.");
              }}
              title="Clear your bag?"
              description="Every item will be removed from your bag. This cannot be undone."
              confirmLabel="Clear bag"
              cancelLabel="Keep items"
            />
          </div>
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}
