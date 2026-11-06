import Link from "next/link";
import { LifterMark } from "@/components/brand/lifter-mark";
import { ContactActions } from "@/components/contact/contact-actions";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { buttonClasses } from "@/components/ui/button";
import { BUSINESS } from "@/lib/business";

export default function NotFound() {
  return (
    <StorefrontShell>
      <div className="container-x flex min-h-[75svh] flex-col justify-center py-20">
        <LifterMark className="h-12 opacity-60" />
        <p className="eyebrow mt-6 text-accent">404</p>
        <h1 className="display mt-3 text-hero">
          Off the
          <br />
          bar<span className="text-accent">.</span>
        </h1>
        <p className="mt-5 max-w-md text-body leading-relaxed text-bone-dim">
          This page is not in the gym. Check the address or get back to the range.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/" className={buttonClasses("primary")}>
            Back home
          </Link>
          <Link href="/shop" className={buttonClasses("secondary")}>
            Shop the range
          </Link>
        </div>

        <div className="mt-12 max-w-xl border-t border-line pt-8">
          <p className="eyebrow text-accent">Need help?</p>
          <p className="mt-2 text-body leading-relaxed text-bone-dim">
            If you were looking for an order or a page that used to be here, call or WhatsApp us and
            we will point you in the right direction.
          </p>
          <ContactActions
            phone={BUSINESS.phone.local}
            email={BUSINESS.email}
            instagram={BUSINESS.instagram.url}
            whatsappMessage="Hi Grip On, I need help finding something on your site."
            className="mt-4"
          />
        </div>
      </div>
    </StorefrontShell>
  );
}
