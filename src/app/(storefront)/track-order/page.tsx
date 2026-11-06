import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { ContactActions } from "@/components/contact/contact-actions";
import { TrackOrderForm } from "@/components/orders/track-order-form";
import { getStoreSettings } from "@/lib/orders/settings";
import { BUSINESS } from "@/lib/business";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Track order",
  description:
    "Follow your Grip On order from packing to delivery using your order number and checkout contact.",
  alternates: { canonical: "/track-order" },
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string | string[] }>;
}) {
  const params = await searchParams;
  const order = Array.isArray(params.order) ? params.order[0] : params.order;
  const settings = await getStoreSettings();
  const contactEmail = settings?.contact_email ?? SITE.email;
  const contactPhone = settings?.contact_phone ?? BUSINESS.phone.local;
  const instagram = settings?.instagram_url ?? SITE.instagram;

  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-8 pt-8 sm:pt-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Track order" },
            ]}
          />

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow text-accent">Where is it?</p>
              <h1 className="display mt-3 text-hero">
                Track it<span className="text-accent">.</span>
              </h1>
            </div>
            <p className="max-w-sm text-body leading-relaxed text-bone-dim">
              Enter your order number and the email or phone number you used at checkout. No account
              needed.
            </p>
          </div>
        </div>
      </section>

      <div className="container-x section-y">
        <TrackOrderForm defaultOrder={order} />

        <section className="mt-8 max-w-2xl rounded-[var(--radius-card)] border border-line bg-ink-soft p-5">
          <h2 className="eyebrow text-bone">Need help?</h2>
          <p className="mt-2 text-body leading-relaxed text-bone-dim">
            Call, WhatsApp or email us and we will look it up with you. Have your order number ready
            if you have it.
          </p>
          <ContactActions
            phone={contactPhone}
            email={contactEmail}
            instagram={instagram}
            whatsappMessage="Hi Grip On, I need help tracking an order."
            className="mt-4"
          />
        </section>
      </div>
    </div>
  );
}
