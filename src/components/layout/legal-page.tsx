import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import { phoneFromLocal } from "@/lib/business";
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
  contactPhone: string;
  businessAddress?: string | null;
  businessRegistration?: string | null;
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
  contactPhone,
  businessAddress,
  businessRegistration,
  sections,
  related,
}: LegalPageProps) {
  const phone = phoneFromLocal(contactPhone);

  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-8 pt-8 sm:pt-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />

          <div className="mt-5 grid gap-5 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow text-accent">{eyebrow}</p>
              <h1 className="display mt-3 text-hero">
                {title}
                <span className="text-accent">.</span>
              </h1>
            </div>
            <p className="max-w-md text-body leading-relaxed text-bone-dim lg:col-span-4">
              {intro}
            </p>
          </div>
        </div>
      </section>

      <div className="container-x grid gap-10 section-y lg:grid-cols-12 lg:gap-12">
        <article className="space-y-8 lg:col-span-8">
          {sections.map((section) => (
            <section key={section.heading} aria-labelledby={headingId(section.heading)}>
              <h3
                id={headingId(section.heading)}
                className="font-sans text-h3 font-semibold uppercase tracking-[0.08em] text-bone"
              >
                {section.heading}
              </h3>
              <div className="mt-3 space-y-3 text-body leading-relaxed text-bone-dim">
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
            <p className="mt-3 text-body leading-relaxed text-bone-dim">
              Questions about an order, your information or these terms? Call, WhatsApp or email us
              and we will answer.
            </p>
            <div className="mt-2 grid">
              <a
                href={phone.tel}
                className="inline-flex min-h-11 items-center gap-1.5 text-sm text-bone transition-colors hover:text-accent"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {phone.display}
              </a>
              <a
                href={phone.whatsapp("Hi Grip On, I have a question about your policies.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm text-bone transition-colors hover:text-accent"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex min-h-11 items-center gap-1.5 text-sm text-bone transition-colors hover:text-accent"
              >
                {contactEmail}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim">
                Related
              </p>
              <ul className="mt-2 space-y-1">
                {related.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 min-w-11 items-center text-sm text-bone/80 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {businessAddress?.trim() || businessRegistration?.trim() ? (
              <div className="mt-5 border-t border-line pt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim">
                  Business details
                </p>
                <address className="mt-2 space-y-1 text-sm not-italic leading-relaxed text-bone/80">
                  {businessAddress?.trim() ? (
                    <span className="block whitespace-pre-line">{businessAddress}</span>
                  ) : null}
                  {businessRegistration?.trim() ? (
                    <span className="block">{businessRegistration}</span>
                  ) : null}
                </address>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
