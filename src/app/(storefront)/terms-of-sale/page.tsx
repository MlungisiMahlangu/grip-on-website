import type { Metadata } from "next";
import Link from "next/link";
import { getStoreSettings } from "@/lib/orders/settings";
import { BUSINESS } from "@/lib/business";
import { SITE } from "@/lib/site";
import { LegalPage, type LegalSection } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Terms of sale",
  description:
    "The terms that apply when you order from Grip On: how orders are confirmed, cash on delivery, delivery costs, cancellations, returns and refunds in South Africa.",
  alternates: { canonical: "/terms-of-sale" },
};

export default async function TermsOfSalePage() {
  const settings = await getStoreSettings();
  const contactEmail = settings?.contact_email || SITE.email;
  const contactPhone = settings?.contact_phone || BUSINESS.phone.local;

  const sections: LegalSection[] = [
    {
      heading: "Who we are",
      body: (
        <>
          <p>
            This store is run by Grip On, a South African gym-apparel label based in Johannesburg.
            These terms apply when you place an order through this site.
          </p>
          <p>
            By confirming an order, you agree to these terms, the{" "}
            <Link href="/shipping-returns" className="prose-link text-bone underline underline-offset-2">
              Shipping &amp; Returns Policy
            </Link>{" "}
            and the{" "}
            <Link href="/privacy" className="prose-link text-bone underline underline-offset-2">
              Privacy Policy
            </Link>
            . If you do not agree, please do not order.
          </p>
        </>
      ),
    },
    {
      heading: "How an order is formed",
      body: (
        <>
          <p>
            An order you submit is an offer to buy. We accept it when we send a confirmation email
            after checking the stock and delivery details. Until then, no sale is complete.
          </p>
          <p>
            We may contact you by email, phone or WhatsApp if we need to check an address, a phone
            number or availability. If we cannot confirm those details within a reasonable time, we
            may cancel the order.
          </p>
          <p>
            We may decline or cancel an order if a piece sells out, a price was listed incorrectly,
            the order looks fraudulent, or the delivery address cannot be reached. If you have
            already paid us, we refund the full amount.
          </p>
        </>
      ),
    },
    {
      heading: "Prices and payment",
      body: (
        <>
          <p>
            All prices are in South African rand. The subtotal, delivery charge where applicable and
            the amount due are shown before you place your order. There are no hidden fees.
          </p>
          <p>
            Cash on delivery is currently the only payment method. You pay the courier when the
            parcel arrives. We do not collect or store card details, and card and instant EFT are
            marked as unavailable until we add them.
          </p>
          <p>
            Please have the exact total ready where possible. Courier drivers may not carry enough
            change for large notes.
          </p>
        </>
      ),
    },
    {
      heading: "Availability",
      body: (
        <>
          <p>
            Availability is updated by hand. A piece can sell out between adding it to your bag and
            placing the order. If that happens, we contact you before cancelling and you pay nothing
            for the unavailable item.
          </p>
          <p>
            We do not substitute a different colour, size or product without asking you first.
          </p>
        </>
      ),
    },
    {
      heading: "Delivery",
      body: (
        <>
          <p>
            Delivery is free in Johannesburg. Outside Johannesburg, we contact you after checkout to
            confirm the courier cost and options before dispatch. That cost is added to the amount
            you pay on delivery.
          </p>
          <p>
            We deliver across South Africa by courier and do not currently deliver outside South
            Africa. Give us a street address where someone aged 18 or older can receive and pay for
            the parcel. If the address or phone number is wrong, delivery may fail or be delayed.
          </p>
          <p>
            Delivery estimates are estimates, not guarantees. Couriers can be delayed by weather,
            load-shedding, public holidays or events outside our control. See{" "}
            <Link href="/shipping-returns" className="prose-link text-bone underline underline-offset-2">
              Shipping &amp; returns
            </Link>{" "}
            for the current timing and rules.
          </p>
        </>
      ),
    },
    {
      heading: "Risk and ownership",
      body: (
        <p>
          Risk in the goods passes to you when the parcel is delivered to the address on the order.
          Ownership passes when we have received payment in full, which happens when you pay the
          courier on delivery.
        </p>
      ),
    },
    {
      heading: "Cancelling before dispatch",
      body: (
        <>
          <p>
            You can cancel an order before it is dispatched at no cost. Email or WhatsApp us with
            your order number as soon as possible. If we have not dispatched the parcel, we cancel
            it and you owe nothing.
          </p>
          <p>
            Once the parcel is with the courier, our normal returns process applies. We cannot
            recall a parcel that is already in transit.
          </p>
        </>
      ),
    },
    {
      heading: "Returns, exchanges and refunds",
      body: (
        <>
          <p>
            You have 14 days from delivery to return unworn, unwashed pieces with their tags and
            original packaging. The full process is set out in{" "}
            <Link href="/shipping-returns" className="prose-link text-bone underline underline-offset-2">
              Shipping &amp; returns
            </Link>
            .
          </p>
          <p>
            Because orders are paid in cash on delivery, refunds are paid by EFT to a South African
            bank account in your name. We do not send cash back through the courier. Once the return
            arrives and passes inspection, we refund within 10 working days.
          </p>
        </>
      ),
    },
    {
      heading: "Faulty or incorrect goods",
      body: (
        <>
          <p>
            If a piece arrives damaged, defective or is not what you ordered, contact us as soon as
            you notice. We will arrange a collection, then replace the item or refund you in full,
            including the delivery fee we charged.
          </p>
          <p>
            The Consumer Protection Act gives you a six-month implied warranty on goods. If a piece
            fails to meet that standard, we will repair, replace or refund it as the Act requires.
            Nothing in these terms shortens that warranty or any other right you cannot legally
            waive.
          </p>
        </>
      ),
    },
    {
      heading: "Your consumer rights",
      body: (
        <p>
          These terms sit alongside your rights under the Consumer Protection Act, 2008 and the
          Electronic Communications and Transactions Act, 2002. Nothing here is intended to reduce
          those rights. If a dispute cannot be resolved with us, consumers can approach the
          National Consumer Commission or a court with jurisdiction in South Africa.
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
            <a href={`mailto:${contactEmail}`} className="prose-link text-bone underline underline-offset-2">
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
      eyebrow="Terms of sale"
      title="Ordering, plainly"
      intro="How an order is confirmed, how cash on delivery works, what delivery costs and how returns and refunds are handled."
      updated="6 November 2026"
      contactEmail={contactEmail}
      contactPhone={contactPhone}
      businessAddress={settings?.business_address}
      businessRegistration={settings?.business_registration}
      sections={sections}
      related={[
        { label: "Shipping & returns", href: "/shipping-returns" },
        { label: "Privacy policy", href: "/privacy" },
        { label: "FAQ", href: "/faq" },
      ]}
    />
  );
}
