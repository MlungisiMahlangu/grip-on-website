import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Banknote, Check, MapPin, PackageCheck } from "lucide-react";
import { getTrackedOrder, readOrderAccess } from "@/lib/orders/track";
import { getStoreSettings } from "@/lib/orders/settings";
import { BUSINESS } from "@/lib/business";
import { SITE } from "@/lib/site";
import { ORDER_STATUS_LABELS, formatOrderDate } from "@/lib/orders/format";
import { formatPriceCents } from "@/lib/utils";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { ContactActions } from "@/components/contact/contact-actions";
import { OrderItemsCard, OrderTimelineCard } from "@/components/orders/order-details";
import { buttonClasses } from "@/components/ui/button";
import type { TrackedOrder } from "@/lib/orders/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

function Receipt({
  order,
  contactEmail,
  contactPhone,
  instagram,
}: {
  order: TrackedOrder;
  contactEmail: string;
  contactPhone: string;
  instagram: string | null;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-7">
        <OrderItemsCard order={order} />
      </div>

      <div className="flex flex-col gap-4 lg:col-span-5">
        <section className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-5">
          <h2 className="eyebrow text-bone">Delivery</h2>
          <p className="mt-3 flex items-start gap-2 text-body leading-relaxed text-bone-dim">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.7} />
            {order.customer_first_name}, we are sending your order to {order.city},{" "}
            {order.province}.
          </p>
          <p className="mt-4 flex items-start gap-2 border-t border-line pt-4 text-body leading-relaxed text-bone-dim">
            <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.7} />
            {order.delivery_quote_required && order.delivery_fee_cents === 0
              ? `Have ${formatPriceCents(order.total_cents)} ready for your order. We will contact you to confirm the courier cost before dispatch.`
              : `Have ${formatPriceCents(order.total_cents)} ready for the courier. You pay when it arrives.`}
          </p>
        </section>

        <OrderTimelineCard order={order} />

        <section className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-5">
          <h2 className="eyebrow text-bone">Need help?</h2>
          <p className="mt-2 text-body leading-relaxed text-bone-dim">
            Call or WhatsApp us with your order number and we will sort it out.
          </p>
          <ContactActions
            phone={contactPhone}
            email={contactEmail}
            instagram={instagram}
            whatsappMessage={`Hi Grip On, I have a question about order ${order.order_number}.`}
            className="mt-3"
          />
        </section>

        <div className="flex flex-col gap-3">
          <Link href="/shop" className={buttonClasses("primary", "w-full")}>
            Keep shopping <ArrowRight />
          </Link>
          <Link
            href={`/track-order?order=${encodeURIComponent(order.order_number)}`}
            className={buttonClasses("secondary", "w-full")}
          >
            <PackageCheck />
            Track this order
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const access = await readOrderAccess();

  if (!access || access.number.toUpperCase() !== number.toUpperCase()) {
    notFound();
  }

  const order = await getTrackedOrder(access.number, access.contact);
  if (!order) {
    notFound();
  }

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
              { label: "Shop", href: "/shop" },
              { label: order.order_number },
            ]}
          />

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-2 eyebrow text-accent">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                {ORDER_STATUS_LABELS[order.status]}
              </p>
              <h1 className="display mt-3 text-hero">
                Order placed<span className="text-accent">.</span>
              </h1>
              <p className="mt-3 font-mono text-sm text-bone">{order.order_number}</p>
            </div>
            <p className="max-w-sm text-body leading-relaxed text-bone-dim">
              Placed {formatOrderDate(order.created_at)}. We have your details and we are getting
              your order ready.
            </p>
          </div>
        </div>
      </section>

      <div className="container-x section-y">
        <Receipt
          order={order}
          contactEmail={contactEmail}
          contactPhone={contactPhone}
          instagram={instagram}
        />
      </div>
    </div>
  );
}
