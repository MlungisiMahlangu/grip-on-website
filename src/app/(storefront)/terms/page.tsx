import type { Metadata } from "next";
import Link from "next/link";
import { getStoreSettings } from "@/lib/orders/settings";
import { SITE } from "@/lib/site";
import { LegalPage, type LegalSection } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Terms of sale",
  description:
    "The terms that apply when you shop with Grip On: orders, cash on delivery, delivery, returns and your consumer rights in South Africa.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const settings = await getStoreSettings();
  const contactEmail = settings?.contact_email || SITE.email;

  const sections: LegalSection[] = [
    {
      heading: "Who we are",
      body: (
        <>
          <p>
            This store is run by Grip On, a South African gym-apparel label based in Johannesburg.
            These terms apply when you browse the site or place an order.
          </p>
          <p>
            By using the site or confirming an order, you agree to these terms. If you do not agree,
            please do not order.
          </p>
        </>
      ),
    },
    {
      heading: "Orders and confirmation",
      body: (
        <>
          <p>
            An order you submit is an offer to buy. We confirm it by email once the stock and
            delivery details check out. Until then, no sale is complete.
          </p>
          <p>
            We may decline or cancel an order if a piece sells out, a price was listed incorrectly,
            the order looks fraudulent, or the delivery address cannot be reached. If you have
            already paid us, we will refund the full amount.
          </p>
        </>
      ),
    },
    {
      heading: "Prices and payment",
      body: (
        <>
          <p>
            All prices are in South African rand. The subtotal, delivery fee, any discount and the
            final total are shown before you place your order.
          </p>
          <p>
            Cash on delivery is currently the only payment method. You pay the courier when the
            parcel arrives. We do not collect or store card details. Card and instant EFT are
            marked as unavailable on the checkout page until we add them.
          </p>
        </>
      ),
    },
    {
      heading: "Delivery",
      body: (
        <>
          <p>
            We deliver across South Africa by courier. Give us a street address where someone aged
            18 or older can receive and pay for the parcel. If the address or phone number is wrong,
            delivery may fail or be delayed.
          </p>
          <p>
            Delivery estimates are estimates, not guarantees. Couriers can be delayed by weather,
            load-shedding, public holidays or events outside our control. See{" "}
            <Link href="/shipping-returns" className="text-bone underline underline-offset-2">
              Shipping &amp; returns
            </Link>{" "}
            for the current fee and timing.
          </p>
        </>
      ),
    },
    {
      heading: "Returns and refunds",
      body: (
        <>
          <p>
            Our returns process is set out in{" "}
            <Link href="/shipping-returns" className="text-bone underline underline-offset-2">
              Shipping &amp; returns
            </Link>
            . That process sits alongside your rights under the Consumer Protection Act, 2008 and
            the Electronic Communications and Transactions Act, 2002. Nothing in these terms
            reduces those rights.
          </p>
        </>
      ),
    },
    {
      heading: "Product information",
      body: (
        <>
          <p>
            We describe fabrics, fits and features as accurately as we can. Colours can look
            different from screen to screen, and minor variation between production runs is normal.
          </p>
          <p>
            Stock counts on the site are live, but a piece can sell out between adding it to your
            bag and placing the order. We will contact you before cancelling if that happens.
          </p>
        </>
      ),
    },
    {
      heading: "Using the site",
      body: (
        <>
          <p>You agree not to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Place fraudulent orders or use someone else&apos;s details without permission.</li>
            <li>Scrape, overload, probe or interfere with the site or its security.</li>
            <li>Use the site to break the law or infringe someone else&apos;s rights.</li>
          </ul>
          <p>
            We may suspend access or cancel orders where we reasonably believe the site is being
            misused.
          </p>
        </>
      ),
    },
    {
      heading: "Intellectual property",
      body: (
        <p>
          The Grip On name, marks, product photography, designs and copy belong to Grip On or are
          used with permission. You may view and share our pages for personal, non-commercial use.
          You may not reuse our brand assets or photography commercially without our written
          permission.
        </p>
      ),
    },
    {
      heading: "Liability",
      body: (
        <>
          <p>
            Nothing in these terms limits any right you have under South African consumer law that
            cannot legally be waived, including the Consumer Protection Act&apos;s rules on unsafe
            or defective goods.
          </p>
          <p>
            To the extent the law allows, we are not liable for indirect or consequential loss, and
            our liability for a product is limited to the amount you paid for it. This does not
            apply where the law says otherwise.
          </p>
        </>
      ),
    },
    {
      heading: "Governing law and disputes",
      body: (
        <>
          <p>
            South African law governs these terms. If something goes wrong, email us first at{" "}
            <a href={`mailto:${contactEmail}`} className="text-bone underline underline-offset-2">
              {contactEmail}
            </a>{" "}
            and give us a chance to resolve it.
          </p>
          <p>
            If we cannot resolve it together, either party may take the matter to a court with
            jurisdiction in South Africa. Consumers may also approach the National Consumer
            Commission.
          </p>
        </>
      ),
    },
    {
      heading: "Changes to these terms",
      body: (
        <p>
          We may update these terms when our services or the law change. The date at the bottom of
          this page shows the latest version. An order is governed by the terms in force when it was
          placed.
        </p>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow="Terms"
      title="Terms of sale"
      intro="The short version: honest pricing, cash on delivery, real stock and your South African consumer rights intact."
      updated="6 November 2026"
      contactEmail={contactEmail}
      sections={sections}
      related={[
        { label: "Privacy policy", href: "/privacy" },
        { label: "Shipping & returns", href: "/shipping-returns" },
      ]}
    />
  );
}
