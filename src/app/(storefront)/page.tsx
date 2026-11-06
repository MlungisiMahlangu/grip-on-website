import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Banknote, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { SITE, VALUE_PROPS } from "@/lib/site";
import { getStoreSettings } from "@/lib/orders/settings";
import { buttonClasses } from "@/components/ui/button";
import { LifterMark } from "@/components/brand/lifter-mark";
import { Marquee } from "@/components/layout/marquee";
import { FeaturedProducts } from "@/components/catalogue/featured-products";

export const metadata: Metadata = {
  title: "Gym apparel built for the work",
  description: SITE.description,
  alternates: { canonical: "/" },
};

const icons = [Truck, Banknote, ShieldCheck, RotateCcw];

export default async function HomePage() {
  const settings = await getStoreSettings();
  const freeDeliveryArea = settings?.free_delivery_area || SITE.freeDeliveryArea;
  const instagram = settings?.instagram_url ?? SITE.instagram;

  return (
    <>
      <section className="relative -mt-16 flex min-h-[calc(100svh-var(--announcement-height))] flex-col justify-end overflow-hidden bg-ink lg:-mt-20">
        <picture>
          <source media="(min-width: 768px)" srcSet="/media/phase1/hero-overhead-press.webp" />
          <img
            src="/media/phase1/hero-tee-portrait.webp"
            alt="Lifter in Grip On gear pressing a barbell overhead in a dark gym"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-transparent" />

        <div className="container-x relative z-10 pb-12 pt-32 sm:pb-16 lg:pb-20">
          <p className="eyebrow animate-fade text-accent" style={{ animationDelay: "80ms" }}>
            Student-founded · Johannesburg
          </p>
          <h1 className="display mt-5 max-w-5xl text-hero">
            <span className="block animate-rise" style={{ animationDelay: "140ms" }}>
              Built
            </span>
            <span className="block animate-rise text-bone/90" style={{ animationDelay: "220ms" }}>
              for the
            </span>
            <span className="block animate-rise" style={{ animationDelay: "300ms" }}>
              work<span className="text-accent">.</span>
            </span>
          </h1>

          <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="animate-rise max-w-md" style={{ animationDelay: "380ms" }}>
              <p className="text-body leading-relaxed text-bone/80">
                Gym apparel for people who show up. Small runs, honest prices and gear that holds up
                set after set.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/shop" className={buttonClasses("primary")}>
                  Shop the range <ArrowRight />
                </Link>
                <Link href="#story" className={buttonClasses("secondary")}>
                  The lifter
                </Link>
              </div>
            </div>

            <p
              className="animate-fade font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-bone/70"
              style={{ animationDelay: "500ms" }}
            >
              Free delivery in {freeDeliveryArea}
              <br />
              Cash on delivery
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 right-6 z-10 hidden items-center gap-3 text-bone/70 lg:flex">
          <span className="eyebrow">Scroll</span>
          <span className="h-12 w-px bg-bone/30" />
        </div>
      </section>

      <Marquee />

      <FeaturedProducts />

      <section className="border-b border-line bg-ink section-y">
        <div className="container-x grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow text-accent">The standard</p>
            <h2 className="display mt-5 text-h2">
              We make gear
              <br />
              for the work.
              <br />
              <span className="text-bone/45">Not the highlight reel.</span>
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="max-w-sm text-body leading-relaxed text-bone-dim">
              No staged gym selfies. No disposable fabric. Every piece is cut for training, finished
              in small runs and priced to be worn hard.
            </p>
          </div>
        </div>
      </section>

      <section id="story" className="border-b border-line bg-ink section-y">
        <div className="container-x grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-ink-soft">
            <Image
              src="/media/phase1/story-back-corridor.webp"
              alt="Lifter walking through a dark gym corridor in Grip On gear"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 flex items-end gap-3">
              <LifterMark className="h-10" />
              <span className="eyebrow text-bone/70">The mark on the back</span>
            </div>
          </div>

          <div>
            <p className="eyebrow text-accent">The lifter</p>
            <h2 className="display mt-4 text-h2">
              The overhead press is the honest test.
            </h2>
            <p className="mt-6 max-w-lg text-body leading-relaxed text-bone-dim">
              No momentum. No shortcuts. Just you, the bar and the work. We put the lifter on the
              back of every piece because it is the standard we build to.
            </p>
            <Link href="/about" className={buttonClasses("secondary", "mt-8")}>
              Read our story <ArrowUpRight />
            </Link>
          </div>
        </div>
      </section>

      <section id="values" className="border-b border-line bg-light section-y text-ink">
        <div className="container-x">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-ink/65">Why Grip On</p>
              <h2 className="display mt-3 text-h2">Built around the basics.</h2>
            </div>
            <p className="max-w-sm text-body leading-relaxed text-ink/60">
              The parts of ordering online that should be simple, kept simple.
            </p>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((item, index) => {
              const Icon = icons[index] ?? Truck;
              return (
                <div key={item.title} className="bg-light p-6 sm:p-7">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <h3 className="mt-6 font-sans text-h3 font-semibold uppercase tracking-[0.08em]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-body leading-relaxed text-ink/60">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink">
        <div className="relative min-h-[75svh]">
          <Image
            src="/media/phase1/community.webp"
            alt="Grip On lifters training together in the gym"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/60 to-ink/20" />
          <div className="container-x relative flex min-h-[75svh] items-center py-20">
            <div className="max-w-2xl">
              <p className="eyebrow text-accent">The community</p>
              <h2 className="display mt-5 text-h2">
                The work is
                <br />
                better together<span className="text-accent">.</span>
              </h2>
              <p className="mt-6 max-w-md text-body leading-relaxed text-bone/75">
                Training partners, early mornings and the people who keep showing up. Follow what we
                are building.
              </p>
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                className={buttonClasses("secondary", "mt-8")}
              >
                Follow on Instagram <ArrowUpRight />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
