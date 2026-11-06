import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { FOOTER_NAV, SITE } from "@/lib/site";
import { phoneFromLocal } from "@/lib/business";
import { LifterMark } from "@/components/brand/lifter-mark";
import { Wordmark } from "@/components/brand/wordmark";
import { InstagramIcon } from "@/components/ui/instagram-icon";

export function SiteFooter({
  email,
  phone,
  instagram,
  freeDeliveryArea,
}: {
  email: string;
  phone: string;
  instagram: string | null;
  freeDeliveryArea: string;
}) {
  const links = phoneFromLocal(phone);

  return (
    <footer className="border-t border-line bg-ink">
      <div className="container-x py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="flex items-end gap-4">
              <LifterMark className="h-12" />
              <Wordmark className="h-7" />
            </div>
            <p className="mt-6 max-w-sm text-body leading-relaxed text-bone-dim">
              Gym apparel built for the work. Student-founded in Johannesburg, made in small runs
              and delivered across South Africa.
            </p>
            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone transition-colors hover:text-accent"
              >
                <InstagramIcon className="h-4 w-4" />
                Follow the community
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            {FOOTER_NAV.map((group) => (
              <div key={group.title}>
                <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-bone-dim">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-1">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-11 min-w-11 items-center text-sm text-bone/80 transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-2.5">
          <span className="rounded-full border border-line px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-bone-dim">
            Cash on delivery
          </span>
          <span className="rounded-full border border-line px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-bone-dim">
            Free delivery in {freeDeliveryArea}
          </span>
          <span className="rounded-full border border-line px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-bone-dim">
            Delivered nationwide
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-5 border-t border-line pt-6 text-[11px] text-bone-dim sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Grip On. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.7} />
              {SITE.location}
            </span>
            <a
              href={links.tel}
              className="inline-flex min-h-11 items-center gap-1.5 transition-colors hover:text-bone"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={1.7} />
              {links.display}
            </a>
            <a
              href={links.whatsapp("Hi Grip On, I have a question about an order.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 transition-colors hover:text-bone"
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.7} />
              WhatsApp
            </a>
            <a
              href={`mailto:${email}`}
              className="inline-flex min-h-11 items-center gap-1.5 transition-colors hover:text-bone"
            >
              <Mail className="h-3.5 w-3.5" strokeWidth={1.7} />
              {email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
