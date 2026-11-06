import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { getStoreSettings } from "@/lib/orders/settings";
import { BUSINESS, phoneFromLocal } from "@/lib/business";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about cash on delivery, delivery costs and timing, tracking, returns, refunds, sizing and contacting Grip On.",
  alternates: { canonical: "/faq" },
};

const FAQ_GROUPS = [
  {
    title: "Orders and payment",
    items: [
      {
        question: "How do I pay?",
        answer:
          "Cash on delivery is the only payment method for now. You pay the courier when the parcel arrives. We do not collect or store card details, and card and instant EFT are not available yet.",
      },
      {
        question: "How will I know my order went through?",
        answer:
          "You will see a confirmation page and receive an email with your order number. We may call or WhatsApp the number on the order if we need to check an address, a phone number or availability. An order is confirmed once we have checked those details.",
      },
      {
        question: "Can I change or cancel my order?",
        answer:
          "Email or WhatsApp us with your order number as soon as possible. We can change or cancel an order before it is dispatched. Once it is with the courier, our returns process applies instead.",
      },
      {
        question: "Do I need an account to order?",
        answer:
          "No. You can check out as a guest with your contact and delivery details. Your bag and wishlist are saved in your browser on this device.",
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      {
        question: "Where do you deliver?",
        answer:
          "We deliver to every province in South Africa by courier. We do not currently deliver outside South Africa.",
      },
      {
        question: "Is delivery free?",
        answer:
          "Delivery is free in Johannesburg. Outside Johannesburg, we contact you after checkout to confirm the courier cost and options before dispatch. That cost is added to the amount you pay on delivery.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Most orders arrive within 2 to 5 working days after we confirm them. Outlying areas can take longer. Weekends and public holidays are not working days.",
      },
      {
        question: "Can I track my order?",
        answer:
          "Yes. Open the Track order page and enter your order number with the email address or phone number used at checkout. It shows the latest status we hold.",
      },
      {
        question: "What if no one is there to receive the parcel?",
        answer:
          "Someone aged 18 or older must be at the address to receive and pay for the parcel. If delivery fails, the courier may take it back and we will contact you to arrange another attempt. Repeated failed deliveries may mean we ask you to collect from a courier point or cancel the order.",
      },
    ],
  },
  {
    title: "Returns and refunds",
    items: [
      {
        question: "What is your returns policy?",
        answer:
          "You have 14 days from delivery to return unworn, unwashed pieces with their tags and original packaging. Email us with your order number and what you want to return, and we will confirm whether to send the parcel back or arrange a collection.",
      },
      {
        question: "How do refunds work?",
        answer:
          "Because orders are paid in cash on delivery, refunds are paid by EFT to a South African bank account in your name. Once the return arrives and passes inspection, we refund within 10 working days. We do not send cash back through the courier.",
      },
      {
        question: "Can I exchange for another size?",
        answer:
          "Yes, if we have the size in stock. Email us before sending anything back. If your size is unavailable, we will process a refund instead. Pieces must still be unworn, unwashed and tagged.",
      },
      {
        question: "What if the item is faulty or wrong?",
        answer:
          "Contact us as soon as you notice, ideally within 7 days of delivery, with your order number and photos. We will arrange a collection, then replace the item or refund you in full, including the delivery fee. We cover the return courier in these cases.",
      },
    ],
  },
  {
    title: "Products and sizing",
    items: [
      {
        question: "How do I choose a size?",
        answer:
          "Each product page lists the sizes available. If you are between sizes, message us with your usual size and measurements and we will advise before you order.",
      },
      {
        question: "Will the colour look exactly like the photos?",
        answer:
          "We photograph pieces as accurately as we can, but screens vary and small differences between production runs are normal for clothing made in short runs.",
      },
      {
        question: "Do you restock sold-out sizes?",
        answer:
          "We make small runs, so restocks depend on the piece. The product page shows what is available now. If a size is sold out, contact us and we will tell you honestly whether it is coming back.",
      },
    ],
  },
  {
    title: "Contact and information",
    items: [
      {
        question: "How do I contact you?",
        answer:
          "Call or WhatsApp us on the number on this page, email us, or use the contact form. We reply within one working day, Monday to Friday, 09:00 to 17:00 SAST.",
      },
      {
        question: "Where are you based?",
        answer:
          "We are based in Johannesburg and pack orders from there. Orders are delivered by courier across South Africa.",
      },
      {
        question: "How is my personal information handled?",
        answer:
          "We collect only what an order needs and use it to confirm, deliver and support that order. Our Privacy Policy sets out what we collect, why we need it, who can see it and your rights under POPIA.",
      },
    ],
  },
] as const;

export default async function FaqPage() {
  const settings = await getStoreSettings();
  const email = settings?.contact_email || SITE.email;
  const contactPhone = settings?.contact_phone || BUSINESS.phone.local;
  const contact = phoneFromLocal(contactPhone);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    ),
  };

  return (
    <div className="bg-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="border-b border-line">
        <div className="container-x pb-8 pt-8 sm:pt-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />

          <div className="mt-5 grid gap-5 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow text-accent">FAQ</p>
              <h1 className="display mt-3 text-hero">
                Answers before you order<span className="text-accent">.</span>
              </h1>
            </div>
            <p className="max-w-md text-body leading-relaxed text-bone-dim lg:col-span-4">
              Payment, delivery, returns and sizing. If your question is not here, call, WhatsApp or
              email us and a person will answer.
            </p>
          </div>
        </div>
      </section>

      <div className="container-x py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-10 lg:col-span-8">
            {FAQ_GROUPS.map((group) => (
              <section key={group.title} aria-labelledby={`faq-${group.title.replace(/\W+/g, "-")}`}>
                <h2
                  id={`faq-${group.title.replace(/\W+/g, "-")}`}
                  className="eyebrow text-accent"
                >
                  {group.title}
                </h2>
                <div className="mt-3 border-t border-line">
                  {group.items.map((item) => (
                    <details key={item.question} className="group border-b border-line">
                      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-medium text-bone transition-colors hover:text-accent [&::-webkit-details-marker]:hidden sm:text-base">
                        {item.question}
                        <ChevronDown
                          className="h-4 w-4 shrink-0 text-bone-dim transition-transform group-open:rotate-180"
                          strokeWidth={1.7}
                          aria-hidden="true"
                        />
                      </summary>
                      <p className="max-w-2xl pb-5 pr-6 text-body leading-relaxed text-bone-dim">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside aria-labelledby="faq-help" className="lg:col-span-4">
            <div className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-5 lg:sticky lg:top-28">
              <h2 id="faq-help" className="eyebrow text-bone">
                Still stuck?
              </h2>
              <p className="mt-3 text-body leading-relaxed text-bone-dim">
                Tell us what you need and we will sort it out. We reply within one working day.
              </p>

              <div className="mt-2 grid">
                <a
                  href={contact.tel}
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm text-bone transition-colors hover:text-accent"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {contact.display}
                </a>
                <a
                  href={contact.whatsapp("Hi Grip On, I have a question.")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm text-bone transition-colors hover:text-accent"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex min-h-11 items-center gap-1.5 break-all text-sm text-bone transition-colors hover:text-accent"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {email}
                </a>
              </div>

              <div className="flex items-start gap-1.5 border-t border-line pt-3 text-xs leading-relaxed text-bone-dim">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.7} aria-hidden="true" />
                <span>
                  {SITE.location}
                  <br />
                  Monday to Friday, 09:00 to 17:00 SAST
                </span>
              </div>

              <div className="mt-5 border-t border-line pt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim">
                  Quick links
                </p>
                <ul className="mt-2 grid">
                  <li>
                    <Link
                      href="/track-order"
                      className="inline-flex min-h-11 items-center text-sm text-bone/80 transition-colors hover:text-accent"
                    >
                      Track an order
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="inline-flex min-h-11 items-center text-sm text-bone/80 transition-colors hover:text-accent"
                    >
                      Send a message
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shipping-returns"
                      className="inline-flex min-h-11 items-center text-sm text-bone/80 transition-colors hover:text-accent"
                    >
                      Shipping &amp; returns
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
