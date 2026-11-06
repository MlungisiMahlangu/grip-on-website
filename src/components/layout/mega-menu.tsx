"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { COLLECTIONS } from "@/lib/site";

export function MegaMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open ? (
          <motion.div
            id="mega-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.22, 0.7, 0.2, 1] }}
            className="absolute inset-x-0 top-full hidden border-b border-line bg-ink shadow-2xl lg:block"
          >
            <div className="container-x grid grid-cols-12 gap-10 py-10">
              <div className="col-span-8">
                <p className="eyebrow text-bone-dim">Shop by collection</p>
                <div className="mt-6 grid grid-cols-3 gap-x-8 gap-y-5">
                  {COLLECTIONS.map((collection, index) => (
                    <Link
                      key={collection.slug}
                      href={`/collections/${collection.slug}`}
                      onClick={onClose}
                      className="group border-t border-line pt-3"
                    >
                      <span className="font-mono text-[10px] text-bone-dim">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-1.5 flex items-center justify-between gap-2">
                        <span className="display text-2xl transition-colors group-hover:text-accent">
                          {collection.name}
                        </span>
                        <ArrowUpRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                      </span>
                      <span className="mt-1 block text-caption leading-relaxed text-bone-dim">
                        {collection.description}
                      </span>
                    </Link>
                  ))}
                  <Link href="/shop" onClick={onClose} className="group border-t border-line pt-3">
                    <span className="font-mono text-[10px] text-accent">All</span>
                    <span className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="display text-2xl transition-colors group-hover:text-accent">
                        Shop all
                      </span>
                      <ArrowUpRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                    <span className="mt-1 block text-caption leading-relaxed text-bone-dim">
                      Every piece in one place.
                    </span>
                  </Link>
                </div>
              </div>

              <div className="col-span-4">
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-ink-soft"
                >
                  <Image
                    src="/media/phase1/story-back-corridor.webp"
                    alt="Athlete walking through a gym corridor in Grip On gear"
                    fill
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                    <div>
                      <p className="eyebrow text-accent">The full range</p>
                      <p className="display mt-2 text-h3">Shop all</p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-bone/30 transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-ink">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}
