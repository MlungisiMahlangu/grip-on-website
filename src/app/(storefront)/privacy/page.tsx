import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/orders/settings";
import { BUSINESS } from "@/lib/business";
import { SITE } from "@/lib/site";
import { LegalPage, type LegalSection } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Grip On collects, uses and protects your personal information under POPIA, and the rights you have over it.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const settings = await getStoreSettings();
  const contactEmail = settings?.contact_email || SITE.email;
  const contactPhone = settings?.contact_phone || BUSINESS.phone.local;

  const sections: LegalSection[] = [
    {
      heading: "Who we are",
      body: (
        <>
          <p>
            Grip On is a South African gym-apparel label based in Johannesburg. We are the
            responsible party for the personal information described in this policy under the
            Protection of Personal Information Act, 2013 (POPIA).
          </p>
          <p>
            If you have a question about your information, email{" "}
            <a href={`mailto:${contactEmail}`} className="prose-link text-bone underline underline-offset-2">
              {contactEmail}
            </a>
            . Our Information Officer monitors that address and handles information requests.
          </p>
        </>
      ),
    },
    {
      heading: "What we collect",
      body: (
        <>
          <p>We collect what an order needs, and nothing more:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Your name, email address and mobile number.</li>
            <li>The delivery address, including suburb, city, province and postal code.</li>
            <li>The pieces, sizes, quantities and prices in your order.</li>
            <li>Any delivery notes or messages you send us.</li>
            <li>Your email address if you choose to join the subscriber list.</li>
          </ul>
          <p>
            Your cart and wishlist are stored in your browser on your device. They are not sent to
            us until you place an order. We do not collect card details because orders are paid in
            cash on delivery.
          </p>
        </>
      ),
    },
    {
      heading: "Why we use it",
      body: (
        <>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>To confirm, pack, deliver and track your order.</li>
            <li>To contact you if there is a problem with stock, payment or delivery.</li>
            <li>To answer messages and process returns or refunds.</li>
            <li>To send occasional new-gear emails, only if you opted in.</li>
            <li>To keep the records we need for consumer-law purposes.</li>
            <li>To prevent fraudulent or abusive orders.</li>
          </ul>
          <p>
            We do not sell, rent or trade your personal information, and we do not run advertising
            pixels on this site.
          </p>
          <p>
            Every marketing email includes a way to unsubscribe. You can also email us and ask to be
            removed. Unsubscribing from marketing does not stop order and delivery messages.
          </p>
        </>
      ),
    },
    {
      heading: "Why we are allowed to use it",
      body: (
        <>
          <p>
            POPIA allows us to process personal information only for a lawful reason. We rely on the
            following:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="font-medium text-bone">Performing our contract:</strong> taking,
              packing and delivering your order, and handling returns.
            </li>
            <li>
              <strong className="font-medium text-bone">Legal obligations:</strong> keeping
              consumer records for the required periods.
            </li>
            <li>
              <strong className="font-medium text-bone">Consent:</strong> sending marketing emails,
              which you can withdraw at any time.
            </li>
            <li>
              <strong className="font-medium text-bone">Legitimate interests:</strong> preventing
              fraud, securing the site and answering customer queries.
            </li>
          </ul>
        </>
      ),
    },
    {
      heading: "Who can see it",
      body: (
        <>
          <p>
            Access is limited to the people who run the store. We share information with service
            providers only where they need it to do their job:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Supabase hosts our database, authentication and product images.</li>
            <li>Resend delivers order and contact emails.</li>
            <li>Our courier partners receive the name, address and phone number needed to deliver.</li>
          </ul>
          <p>
            These providers process information on our instructions. Some may store or process data
            outside South Africa; where they do, we rely on their contractual safeguards for
            cross-border transfers. We may also disclose information where the law requires it.
          </p>
        </>
      ),
    },
    {
      heading: "How long we keep it",
      body: (
        <>
          <p>
            Order records are kept for as long as needed to handle returns, refunds and consumer
            queries. Subscriber details are kept until you opt out. Contact messages are kept until
            the query is resolved, then archived or deleted.
          </p>
          <p>
            When information is no longer needed, we delete it or remove the details that identify
            you.
          </p>
        </>
      ),
    },
    {
      heading: "Cookies and local storage",
      body: (
        <>
          <p>
            The storefront uses your browser&apos;s local storage for your cart and wishlist, so they
            survive a page refresh. Admin sign-in uses essential authentication cookies. These are
            not advertising cookies.
          </p>
          <p>
            You can clear local storage and cookies in your browser at any time. Clearing them
            empties your saved cart and wishlist on that device.
          </p>
        </>
      ),
    },
    {
      heading: "Your rights",
      body: (
        <>
          <p>Under POPIA you may ask us to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Confirm what personal information we hold about you and give you a copy.</li>
            <li>Correct information that is wrong or out of date.</li>
            <li>Delete information we no longer have a lawful reason to keep.</li>
            <li>Stop using your information for marketing.</li>
            <li>Object to processing in the circumstances POPIA allows.</li>
          </ul>
          <p>
            Email{" "}
            <a href={`mailto:${contactEmail}`} className="prose-link text-bone underline underline-offset-2">
              {contactEmail}
            </a>{" "}
            and we will respond within a reasonable time. We may need to verify your identity before
            we act.
          </p>

        </>
      ),
    },
    {
      heading: "Security",
      body: (
        <>
          <p>
            Access to customer and order data is restricted, and our database tables use row-level
            security so one customer cannot read another customer&apos;s orders. Information is
            encrypted in transit.
          </p>
          <p>
            No system is perfectly secure. If we become aware of a breach that affects your
            information, we will notify you as soon as possible. If you spot a security problem,
            email us and give us a chance to fix it before sharing it publicly.
          </p>
        </>
      ),
    },
    {
      heading: "Changes to this policy",
      body: (
        <p>
          We may update this policy when our services or the law change. The date at the bottom of
          this page shows the latest version.
        </p>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow="Privacy"
      title="Your information"
      intro="What we collect, why we need it, who can see it and how to exercise your rights under POPIA."
      updated="6 November 2026"
      contactEmail={contactEmail}
      contactPhone={contactPhone}
      businessAddress={settings?.business_address}
      businessRegistration={settings?.business_registration}
      sections={sections}
      related={[
        { label: "Terms of sale", href: "/terms-of-sale" },
        { label: "Terms & conditions", href: "/terms" },
        { label: "Shipping & returns", href: "/shipping-returns" },
      ]}
    />
  );
}
