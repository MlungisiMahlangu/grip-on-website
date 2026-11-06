"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import { phoneFromLocal } from "@/lib/business";
import { Wordmark } from "@/components/brand/wordmark";
import { LifterMark } from "@/components/brand/lifter-mark";
import { InstagramIcon } from "@/components/ui/instagram-icon";

const ALLOWED_PREFIXES = ["/track-order", "/order"];

export function MaintenanceGate({
  message,
  contactEmail,
  contactPhone,
  instagram,
  children,
}: {
  message: string;
  contactEmail: string;
  contactPhone: string;
  instagram: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const phone = phoneFromLocal(contactPhone);
  const allowed = ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (allowed) return <>{children}</>;

  return (
    <div className="flex min-h-svh flex-col bg-ink">
      <header className="border-b border-line">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <Wordmark className="h-7" priority />
          <span className="eyebrow text-bone-dim">Store update</span>
        </div>
      </header>

      <main id="main-content" className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-lg">
          <LifterMark className="h-12 opacity-60" />
          <p className="eyebrow mt-8 text-accent">Back shortly</p>
          <h1 className="display mt-4 text-hero">
            We are making
            <br />
            some changes<span className="text-accent">.</span>
          </h1>
          <p className="mt-5 max-w-md text-body leading-relaxed text-bone-dim">
            {message}
          </p>

          <div className="mt-8 flex flex-col gap-2 text-sm">
            <Link
              href="/track-order"
              className="inline-flex min-h-11 items-center gap-2 text-bone transition-colors hover:text-accent"
            >
              Track an existing order
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href={phone.tel}
              className="inline-flex min-h-11 items-center gap-2 text-bone transition-colors hover:text-accent"
            >
              <Phone className="h-4 w-4 text-bone-dim" strokeWidth={1.7} aria-hidden="true" />
              Call {phone.display}
            </a>
            <a
              href={phone.whatsapp("Hi Grip On, I have a question about an order.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-bone transition-colors hover:text-accent"
            >
              <MessageCircle
                className="h-4 w-4 text-bone-dim"
                strokeWidth={1.7}
                aria-hidden="true"
              />
              WhatsApp
            </a>
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex min-h-11 items-center gap-2 text-bone transition-colors hover:text-accent"
            >
              <Mail className="h-4 w-4 text-bone-dim" strokeWidth={1.7} aria-hidden="true" />
              {contactEmail}
            </a>
            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-bone transition-colors hover:text-accent"
              >
                <InstagramIcon className="h-4 w-4 text-bone-dim" />
                Instagram
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
