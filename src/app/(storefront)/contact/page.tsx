import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { ContactForm } from "@/components/contact/contact-form";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { getStoreSettings } from "@/lib/orders/settings";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Ask about an order, sizing, returns or wholesale. We reply within one working day from Johannesburg.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const email = settings?.contact_email ?? SITE.email;
  const instagram = settings?.instagram_url ?? SITE.instagram;

  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-8 pt-8 sm:pt-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow text-accent">Contact</p>
              <h1 className="display mt-3 text-[clamp(3.5rem,10vw,8rem)]">
                Talk to us<span className="text-accent">.</span>
              </h1>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-bone-dim">
              Order questions, sizing, returns or wholesale — send a message and a person reads it.
              We reply within one working day.
            </p>
          </div>
        </div>
      </section>

      <div className="container-x py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <section aria-labelledby="contact-form-heading">
            <h2 id="contact-form-heading" className="eyebrow text-bone">
              Send a message
            </h2>
            <div className="mt-4">
              <ContactForm />
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-5">
              <h2 className="eyebrow text-bone">Direct lines</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex min-h-11 items-center gap-2.5 text-bone transition-colors hover:text-accent"
                  >
                    <Mail className="h-4 w-4 text-bone-dim" strokeWidth={1.7} aria-hidden="true" />
                    {email}
                  </a>
                </li>
                {instagram ? (
                  <li>
                    <a
                      href={instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-2.5 text-bone transition-colors hover:text-accent"
                    >
                      <InstagramIcon className="h-4 w-4 text-bone-dim" />
                      Instagram
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </li>
                ) : null}
                <li className="flex min-h-11 items-center gap-2.5 text-bone-dim">
                  <MapPin className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
                  {SITE.location}
                </li>
                <li className="flex min-h-11 items-center gap-2.5 text-bone-dim">
                  <Clock className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
                  Monday to Friday, 09:00–17:00 SAST
                </li>
              </ul>
            </div>

            <div className="rounded-[var(--radius-card)] border border-line p-5">
              <h2 className="eyebrow text-bone">Order updates</h2>
              <p className="mt-3 text-sm leading-relaxed text-bone-dim">
                For an order already on its way, track it with your order number and checkout
                contact. It updates as we pack and hand it to the courier.
              </p>
              <Link
                href="/track-order"
                className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-accent"
              >
                Track an order
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
