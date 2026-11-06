import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";

export type LegalSection = {
  heading: string;
  body: ReactNode;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  contactEmail: string;
  sections: LegalSection[];
  related: Array<{ label: string; href: string }>;
};

function headingId(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  contactEmail,
  sections,
  related,
}: LegalPageProps) {
  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-8 pt-8 sm:pt-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />

          <div className="mt-5 grid gap-5 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow text-accent">{eyebrow}</p>
              <h1 className="display mt-3 text-[clamp(3rem,9vw,6.5rem)]">
                {title}
                <span className="text-accent">.</span>
              </h1>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-bone-dim lg:col-span-4">{intro}</p>
          </div>
        </div>
      </section>

      <div className="container-x grid gap-10 py-9 sm:py-12 lg:grid-cols-12 lg:gap-12">
        <article className="space-y-8 lg:col-span-8">
          {sections.map((section) => (
            <section key={section.heading} aria-labelledby={headingId(section.heading)}>
              <h2
                id={headingId(section.heading)}
                className="font-sans text-base font-semibold uppercase tracking-[0.08em] text-bone"
              >
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-bone-dim sm:text-base">
                {section.body}
              </div>
            </section>
          ))}

          <p className="border-t border-line pt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim">
            Last updated {updated}
          </p>
        </article>

        <aside aria-labelledby="legal-help" className="lg:col-span-4">
          <div className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-5 lg:sticky lg:top-28">
            <h2 id="legal-help" className="eyebrow text-bone">
              Need help?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-bone-dim">
              Questions about an order, your information or these terms? Email us and we will
              answer.
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm text-bone transition-colors hover:text-accent"
            >
              {contactEmail}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <div className="mt-5 border-t border-line pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim">
                Related
              </p>
              <ul className="mt-2 space-y-1">
                {related.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-sm text-bone/80 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
