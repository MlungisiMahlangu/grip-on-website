import type { Metadata } from "next";
import Link from "next/link";
import { deliveryInfo, getStoreSettings } from "@/lib/orders/settings";
import { BUSINESS } from "@/lib/business";
import { SITE } from "@/lib/site";
import { LegalPage, type LegalSection } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description:
    "Grip On delivery across South Africa, cash-on-delivery rules, tracking and our 14-day returns process.",
  alternates: { canonical: "/shipping-returns" },
};

export default async function ShippingReturnsPage() {
  const settings = await getStoreSettings();
  const { info, freeArea } = deliveryInfo(settings);
  const contactEmail = settings?.contact_email || SITE.email;
  const contactPhone = settings?.contact_phone || BUSINESS.phone.local;

  const sections: LegalSection[] = [
    {
      heading: "Where we deliver",
      body: (
        <>
          <p>
            We deliver to every province in South Africa by courier. Give us a street address where
            someone can receive the parcel during the day; a landmark or gate code in the delivery
            notes helps.
          </p>
          <p>
            We do not currently deliver outside South Africa. If you are elsewhere and want to
            arrange something, email us first and we will tell you honestly whether it is possible.
          </p>
        </>
      ),
    },
    {
      heading: "How we confirm your order",
      body: (
        <>
          <p>
            When you place an order, we email a confirmation to the address you gave us. If anything
            about the stock, address or phone number needs checking, we call or WhatsApp the number
            on the order.
          </p>
          <p>
            An order is confirmed once we have checked the stock and delivery details. If we cannot
            confirm it, we cancel it and you owe nothing. Nothing is dispatched until it is
            confirmed.
          </p>
        </>
      ),
    },
    {
      heading: "What delivery costs",
      body: (
        <>
          <p>{info}</p>
          <p>
            Delivery is free in {freeArea}. Outside {freeArea}, we contact you after checkout to
            confirm the courier cost and options before dispatch. The order total at checkout does
            not include that delivery cost.
          </p>
        </>
      ),
    },
    {
      heading: "How long it takes",
      body: (
        <>
          <p>
            Most orders arrive within 2–5 working days after we confirm them. Outlying areas can
            take longer. Weekends and public holidays are not working days.
          </p>
          <p>
            We pack orders from Johannesburg. If a courier is delayed, we will keep you updated by
            email using the contact details you gave at checkout.
          </p>
        </>
      ),
    },
    {
      heading: "Cash on delivery",
      body: (
        <>
          <p>
            Cash on delivery is the only payment method for now. Have the exact total ready when the
            courier arrives; drivers may not carry change.
          </p>
          <p>
            Someone aged 18 or older must be at the address to receive and pay for the parcel. If no
            one can receive it, the courier may take it back and we will contact you to arrange
            another attempt. Repeated failed deliveries may mean we ask you to collect from a
            courier point or cancel the order.
          </p>
        </>
      ),
    },
    {
      heading: "Tracking your order",
      body: (
        <>
          <p>
            Open{" "}
            <Link href="/track-order" className="prose-link text-bone underline underline-offset-2">
              Track order
            </Link>{" "}
            and enter your order number with the email address or phone number used at checkout. You
            will see the status and the delivery details we hold.
          </p>
          <p>
            Keep your order confirmation email. It contains the order number. If you cannot find it,
            email us with the name and email used for the order.
          </p>
        </>
      ),
    },
    {
      heading: "Returns: 14 days",
      body: (
        <>
          <p>
            You have 14 days from delivery to return unworn, unwashed pieces with their tags and
            original packaging. Email{" "}
            <a href={`mailto:${contactEmail}`} className="prose-link text-bone underline underline-offset-2">
              {contactEmail}
            </a>{" "}
            with your order number and what you want to return.
          </p>
          <p>
            We will confirm whether to send the parcel back or arrange a collection. Return courier
            costs are yours unless the piece is faulty or we sent the wrong item. Once the return
            arrives and passes inspection, we refund within 10 working days.
          </p>
          <p>
            Because orders are paid in cash on delivery, refunds are paid by EFT to a South African
            bank account in your name. We do not send cash back through the courier.
          </p>
        </>
      ),
    },
    {
      heading: "Exchanges",
      body: (
        <>
          <p>
            Want a different size? Email us before sending anything back. Exchanges depend on the
            stock we have; if your size is unavailable, we will process a refund instead.
          </p>
          <p>
            Pieces must still be unworn, unwashed and tagged. If the replacement costs more, we will
            confirm the difference with you before proceeding.
          </p>
        </>
      ),
    },
    {
      heading: "Faulty or wrong items",
      body: (
        <>
          <p>
            If a piece arrives damaged, defective or is not what you ordered, contact us as soon as
            you notice, ideally within 7 days of delivery, with your order number and photos. We will
            arrange a collection, then replace the item or refund you in full, including the
            delivery fee. We cover the return courier in these cases.
          </p>
          <p>
            Reporting quickly helps us fix the problem, but it does not shorten the warranty rights
            the Consumer Protection Act gives you for defective goods.
          </p>
        </>
      ),
    },
    {
      heading: "What we cannot accept",
      body: (
        <p>
          We cannot accept returns for pieces that have been worn, washed, altered or damaged after
          delivery, or that are missing their tags or packaging. This does not apply to faulty items
          or items that arrived damaged; your rights under the Consumer Protection Act still apply.
        </p>
      ),
    },
    {
      heading: "Your consumer rights",
      body: (
        <p>
          This policy sits alongside your rights under the Consumer Protection Act, 2008 and the
          Electronic Communications and Transactions Act, 2002. Nothing here is intended to reduce
          those rights. If a dispute cannot be resolved by email, consumers can approach the
          National Consumer Commission or a court with jurisdiction in South Africa.
        </p>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow="Shipping & returns"
      title="Delivery, plainly"
      intro={`Free delivery in ${freeArea}. Other areas are quoted before dispatch. Cash on delivery, 14 days to return unworn pieces.`}
      updated="6 November 2026"
      contactEmail={contactEmail}
      contactPhone={contactPhone}
      businessAddress={settings?.business_address}
      businessRegistration={settings?.business_registration}
      sections={sections}
      related={[
        { label: "Terms of sale", href: "/terms-of-sale" },
        { label: "Privacy policy", href: "/privacy" },
        { label: "FAQ", href: "/faq" },
      ]}
    />
  );
}
