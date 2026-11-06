import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { LifterMark } from "@/components/brand/lifter-mark";
import { getStoreSettings } from "@/lib/orders/settings";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "Grip On is gym apparel built for the work: student-founded in Johannesburg, made in small runs and delivered across South Africa.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    title: "Cut for the session",
    body: "Every piece starts with movement: pressing, pulling, squatting. If it gets in the way under the bar, it does not make the range.",
  },
  {
    title: "Small runs, held to a standard",
    body: "We produce in limited quantities and check each run before it ships. Less waste, more attention on the pieces that matter.",
  },
  {
    title: "Sold honestly",
    body: "Cash on delivery, real stock counts and a person on the other end of the inbox. No countdown timers, no invented urgency.",
  },
] as const;

export default async function AboutPage() {
  const settings = await getStoreSettings();
  const instagram = settings?.instagram_url ?? SITE.instagram;

  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-8 pt-8 sm:pt-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Our story" }]} />

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow text-accent">Our story</p>
              <h1 className="display mt-3 text-hero">
                Grip on
                <br />
                the work<span className="text-accent">.</span>
              </h1>
            </div>
            <p className="max-w-md text-body leading-relaxed text-bone-dim">
              We are a small South African label building gym apparel for people who train whether
              or not anyone is watching.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="container-x grid gap-8 section-y lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-ink-soft">
            <Image
              src="/media/phase1/story-back-corridor.webp"
              alt="Lifter walking through a dark gym corridor in Grip On gear"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="eyebrow text-accent">Where it started</p>
            <h2 className="display mt-4 text-h2">
              Built between lectures and late sessions.
            </h2>
            <div className="mt-5 max-w-lg space-y-4 text-body leading-relaxed text-bone-dim">
              <p>
                Grip On started in Johannesburg with a simple frustration: the gear we could afford
                did not survive the training we did, and the gear that did was priced for someone
                else.
              </p>
              <p>
                So we made our own. Student-founded, self-funded and built in small runs. Heavy
                enough to train in, plain enough to wear anywhere, priced so you can buy it without
                thinking twice.
              </p>
              <p>
                We are still small. That is on purpose. It means we can check every order, answer
                every message and change a design when it is not right.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-light section-y text-ink">
        <div className="container-x">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-ink/65">The mark</p>
              <h2 className="display mt-3 text-h2">
                The overhead press is the honest test.
              </h2>
            </div>
            <LifterMark className="h-16 opacity-70" />
          </div>

          <p className="mt-6 measure text-body leading-relaxed text-ink/65">
            No momentum, no shortcuts, just you, the bar and the work. We put the lifter on the back
            of every piece because that is the standard we build to: fabric that moves when you do,
            seams that hold when you push, and a fit that stays where you put it.
          </p>

          <div className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-ink/10 sm:grid-cols-3">
            {PRINCIPLES.map((item) => (
              <div key={item.title} className="bg-light p-6">
                <h3 className="font-sans text-h3 font-semibold uppercase tracking-[0.08em]">
                  {item.title}
                </h3>
                <p className="mt-2 text-body leading-relaxed text-ink/60">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="container-x grid gap-8 section-y lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="order-2 lg:order-1">
            <p className="eyebrow text-accent">How we build</p>
            <h2 className="display mt-4 text-h2">
              Fewer pieces.
              <br />
              Held to a higher bar.
            </h2>
            <div className="mt-5 max-w-lg space-y-4 text-body leading-relaxed text-bone-dim">
              <p>
                We work with a short fabric list and test it in the gym before it goes into
                production. Weight, stretch and recovery matter more than a seasonal colour story.
              </p>
              <p>
                Each run is checked in Johannesburg before it is packed. If something does not meet
                the standard, it does not ship, and we tell you when stock is low instead of letting
                you find out at checkout.
              </p>
              <p>
                Orders go out nationwide by courier, paid cash on delivery. You see the price, the
                delivery fee and the total before you confirm. That is the whole model.
              </p>
            </div>
          </div>
          <div className="relative order-1 aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-ink-soft lg:order-2">
            <Image
              src="/media/phase1/chalk-hands.webp"
              alt="Chalked hands gripping a barbell before a lift"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-ink section-y">
        <div className="container-x flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-accent">Keep going</p>
            <h2 className="display mt-3 text-h2">See what we are building.</h2>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link
              href="/shop"
              className="inline-flex min-h-11 items-center gap-1.5 text-bone transition-colors hover:text-accent"
            >
              Shop the range
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center gap-1.5 text-bone transition-colors hover:text-accent"
            >
              Contact us
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 text-bone transition-colors hover:text-accent"
              >
                Instagram
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
