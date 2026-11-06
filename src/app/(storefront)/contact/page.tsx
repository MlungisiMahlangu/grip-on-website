import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { ContactActions } from "@/components/contact/contact-actions";
import { ContactForm } from "@/components/contact/contact-form";
import { getStoreSettings } from "@/lib/orders/settings";
import { BUSINESS } from "@/lib/business";
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
  const phone = settings?.contact_phone ?? BUSINESS.phone.local;
  const instagram = settings?.instagram_url ?? SITE.instagram;

  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-8 pt-8 sm:pt-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow text-accent">Contact</p>
              <h1 className="display mt-3 text-hero">
                Talk to us<span className="text-accent">.</span>
              </h1>
            </div>
            <p className="max-w-md text-body leading-relaxed text-bone-dim">
              Order questions, sizing, returns or wholesale. Send a message and a person reads it.
              We reply within one working day.
            </p>
          </div>
        </div>
      </section>

      <div className="container-x section-y">
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
              <ContactActions
                phone={phone}
                email={email}
                instagram={instagram}
                whatsappMessage="Hi Grip On, I have a question about an order."
                className="mt-4"
              />
              <ul className="mt-4 space-y-1 border-t border-line pt-3 text-sm text-bone-dim">
                <li className="flex min-h-11 items-center gap-2.5">
                  <MapPin className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
                  {SITE.location}
                </li>
                <li className="flex min-h-11 items-center gap-2.5">
                  <Clock className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
                  Monday to Friday, 09:00 to 17:00 SAST
                </li>
              </ul>
            </div>

            <div className="rounded-[var(--radius-card)] border border-line p-5">
              <h2 className="eyebrow text-bone">Order updates</h2>
              <p className="mt-3 text-body leading-relaxed text-bone-dim">
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
