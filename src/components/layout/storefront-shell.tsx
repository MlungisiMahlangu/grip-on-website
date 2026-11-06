import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DeferredMobileMenu } from "@/components/layout/deferred-mobile-menu";
import { DeferredCartDrawer } from "@/components/cart/deferred-cart-drawer";
import { StorefrontSettingsProvider } from "@/components/providers/storefront-settings-provider";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { BUSINESS } from "@/lib/business";
import { SITE } from "@/lib/site";

type StorefrontShellProps = {
  children: ReactNode;
  announcement?: string;
  contactEmail?: string;
  contactPhone?: string;
  instagram?: string | null;
  deliveryInfo?: string;
  freeDeliveryArea?: string;
};

export function StorefrontShell({
  children,
  announcement = SITE.announcement,
  contactEmail = SITE.email,
  contactPhone = BUSINESS.phone.local,
  instagram = SITE.instagram,
  deliveryInfo = SITE.deliveryInfo,
  freeDeliveryArea = SITE.freeDeliveryArea,
}: StorefrontShellProps) {
  return (
    <StorefrontSettingsProvider
      contactEmail={contactEmail}
      contactPhone={contactPhone}
      instagram={instagram}
      deliveryInfo={deliveryInfo}
      freeDeliveryArea={freeDeliveryArea}
    >
      <ScrollToTop />
      <NavigationProgress />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {announcement ? <AnnouncementBar text={announcement} /> : null}
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter
        email={contactEmail}
        phone={contactPhone}
        instagram={instagram}
        freeDeliveryArea={freeDeliveryArea}
      />
      <DeferredMobileMenu />
      <DeferredCartDrawer />
      <WhatsAppButton />
    </StorefrontSettingsProvider>
  );
}
