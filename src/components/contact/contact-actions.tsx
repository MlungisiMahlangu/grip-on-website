import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { phoneFromLocal } from "@/lib/business";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { buttonClasses } from "@/components/ui/button";

export function ContactActions({
  phone,
  email,
  instagram,
  whatsappMessage,
  className,
}: {
  phone: string;
  email: string;
  instagram: string | null;
  whatsappMessage?: string;
  className?: string;
}) {
  const links = phoneFromLocal(phone);

  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", className)}>
      <a href={links.tel} className={buttonClasses("secondary", "justify-start")}>
        <Phone aria-hidden="true" />
        Call {links.display}
      </a>
      <a
        href={links.whatsapp(whatsappMessage)}
        target="_blank"
        rel="noreferrer"
        className={buttonClasses("secondary", "justify-start")}
      >
        <MessageCircle aria-hidden="true" />
        WhatsApp
      </a>
      <a href={`mailto:${email}`} className={buttonClasses("secondary", "justify-start")}>
        <Mail aria-hidden="true" />
        Email
      </a>
      {instagram ? (
        <a
          href={instagram}
          target="_blank"
          rel="noreferrer"
          className={buttonClasses("secondary", "justify-start")}
        >
          <InstagramIcon className="h-4 w-4" />
          Instagram
          <ArrowUpRight aria-hidden="true" />
        </a>
      ) : null}
    </div>
  );
}
