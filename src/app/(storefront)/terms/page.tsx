import type { Metadata } from "next";
import Link from "next/link";
import { getStoreSettings } from "@/lib/orders/settings";
import { BUSINESS } from "@/lib/business";
import { SITE } from "@/lib/site";
import { LegalPage, type LegalSection } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description:
    "The terms for using the Grip On website: acceptable use, product information, pricing, intellectual property and your rights under South African law.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const settings = await getStoreSettings();
  const contactEmail = settings?.contact_email || SITE.email;
  const contactPhone = settings?.contact_phone || BUSINESS.phone.local;

  const sections: LegalSection[] = [
    {
      heading: "Who we are",
      body: (
        <>
          <p>
            This site is run by Grip On, a South African gym-apparel label based in Johannesburg.
            These terms cover your use of the website. They are separate from the{" "}
            <Link href="/terms-of-sale" className="prose-link text-bone underline underline-offset-2">
              Terms of Sale
            </Link>{" "}
            that apply when you place an order.
          </p>
          <p>
            By browsing the site, you agree to these terms. If you do not agree, please stop using
            the site.
          </p>
        </>
      ),
    },
    {
      heading: "Using the site",
      body: (
        <>
          <p>
            You may browse, search and share our pages for personal, non-commercial use. You agree
            not to:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Place fraudulent orders or use someone else&apos;s details without permission.</li>
            <li>Scrape, overload, probe or interfere with the site or its security.</li>
            <li>Attempt to access admin areas or accounts that are not yours.</li>
            <li>Use the site to break the law or infringe someone else&apos;s rights.</li>
            <li>Upload or send malicious code, spam or abusive content.</li>
          </ul>
          <p>
            We may suspend or block access where we reasonably believe the site is being misused.
          </p>
        </>
      ),
    },
    {
      heading: "Orders and the Terms of Sale",
      body: (
        <p>
          Orders, payment, delivery, returns and refunds are governed by our{" "}
          <Link href="/terms-of-sale" className="prose-link text-bone underline underline-offset-2">
            Terms of Sale
          </Link>
          . If anything on this page conflicts with those terms about an order, the Terms of Sale
          apply to that order.
        </p>
      ),
    },
    {
      heading: "Product information and images",
      body: (
        <>
          <p>
            We describe fabrics, fits and features as accurately as we can. Colours can look
            different from screen to screen, and small differences between production runs are
            normal for clothing made in short runs.
          </p>
          <p>
            Product images are for illustration. A piece may be shown with styling, lighting or
            accessories that are not included. Check the product page for what is included and the
            sizes available.
          </p>
        </>
      ),
    },
    {
      heading: "Prices and currency",
      body: (
        <>
          <p>
            All prices are shown in South African rand. The price you see on a product page is the
            price used at checkout, subject to the delivery terms explained there.
          </p>
          <p>
            We try to keep prices and stock accurate. If a price is listed incorrectly, we may
            cancel the affected order and refund you in full, or contact you before proceeding. We
            will not charge you more than the price you agreed to without your consent.
          </p>
        </>
      ),
    },
    {
      heading: "Accounts and access",
      body: (
        <>
          <p>
            You do not need an account to shop. Admin access is limited to authorised Grip On staff
            and is protected by authentication. You may not share admin credentials or use another
            person&apos;s access.
          </p>
          <p>
            If you believe someone has accessed your account or our admin area without permission,
            email us immediately at{" "}
            <a href={`mailto:${contactEmail}`} className="prose-link text-bone underline underline-offset-2">
              {contactEmail}
            </a>
            .
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
      heading: "Third-party links and services",
      body: (
        <p>
          The site links to services we do not control, such as Instagram and WhatsApp. Their terms
          and privacy policies apply when you use them. We are not responsible for content or
          availability on those services.
        </p>
      ),
    },
    {
      heading: "Availability of the site",
      body: (
        <>
          <p>
            We aim to keep the site online and accurate, but we do not guarantee uninterrupted
            access. Maintenance, updates, load-shedding, network problems or events outside our
            control can take parts of the site offline.
          </p>
          <p>
            We may change, pause or remove parts of the site, including products and collections,
            without notice. We will not remove a paid order because of a site change.
          </p>
        </>
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
      heading: "Privacy",
      body: (
        <p>
          How we collect and use personal information is set out in our{" "}
          <Link href="/privacy" className="prose-link text-bone underline underline-offset-2">
            Privacy Policy
          </Link>
          . It forms part of these terms.
        </p>
      ),
    },
    {
      heading: "Changes to these terms",
      body: (
        <p>
          We may update these terms when the site, our services or the law change. The date at the
          bottom of this page shows the latest version. Continued use of the site after an update
          means you accept the updated terms.
        </p>
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
  ];

  return (
    <LegalPage
      eyebrow="Terms"
      title="Terms & conditions"
      intro="The rules for using this site: honest product information, fair use, our intellectual property and your South African consumer rights."
      updated="6 November 2026"
      contactEmail={contactEmail}
      contactPhone={contactPhone}
      businessAddress={settings?.business_address}
      businessRegistration={settings?.business_registration}
      sections={sections}
      related={[
        { label: "Terms of sale", href: "/terms-of-sale" },
        { label: "Privacy policy", href: "/privacy" },
        { label: "Shipping & returns", href: "/shipping-returns" },
      ]}
    />
  );
}
