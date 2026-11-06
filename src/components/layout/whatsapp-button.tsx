"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { phoneFromLocal, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/business";
import { useStorefrontSettings } from "@/components/providers/storefront-settings-provider";

export function WhatsAppButton() {
  const { contactPhone } = useStorefrontSettings();
  const pathname = usePathname();
  const links = phoneFromLocal(contactPhone);
  const raised = pathname.startsWith("/products/");

  return (
    <a
      href={links.whatsapp(WHATSAPP_DEFAULT_MESSAGE)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Grip On on WhatsApp"
      className={cn(
        "fixed right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-bone/20 bg-accent text-accent-ink shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105 focus-visible:scale-105 sm:right-6",
        raised
          ? "bottom-[calc(6.5rem+env(safe-area-inset-bottom))] lg:bottom-[calc(1rem+env(safe-area-inset-bottom))]"
          : "bottom-[calc(1rem+env(safe-area-inset-bottom))]",
      )}
    >
      <MessageCircle className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
    </a>
  );
}
