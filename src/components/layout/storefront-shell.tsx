import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { StorefrontSettingsProvider } from "@/components/providers/storefront-settings-provider";
import { SITE } from "@/lib/site";

type StorefrontShellProps = {
  children: ReactNode;
  announcement?: string;
  contactEmail?: string;
  instagram?: string | null;
  freeDeliveryThresholdCents?: number;
};

export function StorefrontShell({
  children,
  announcement = SITE.announcement,
  contactEmail = SITE.email,
  instagram = SITE.instagram,
  freeDeliveryThresholdCents = SITE.freeDeliveryThreshold * 100,
}: StorefrontShellProps) {
  return (
    <StorefrontSettingsProvider
      freeDeliveryThresholdCents={freeDeliveryThresholdCents}
      contactEmail={contactEmail}
      instagram={instagram}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <AnnouncementBar text={announcement} />
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter
        email={contactEmail}
        instagram={instagram}
        freeDeliveryThresholdCents={freeDeliveryThresholdCents}
      />
      <MobileMenu />
      <CartDrawer />
    </StorefrontSettingsProvider>
  );
}
