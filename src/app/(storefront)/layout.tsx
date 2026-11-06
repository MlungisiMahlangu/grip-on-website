import type { CSSProperties, ReactNode } from "react";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { MaintenanceGate } from "@/components/layout/maintenance-gate";
import { deliveryInfo, getStoreSettings } from "@/lib/orders/settings";
import { BUSINESS } from "@/lib/business";
import { SITE } from "@/lib/site";

export const revalidate = 300;

const ACCENT = "#FF6A00";
const ACCENT_INK = "#0A0A0A";
const MAINTENANCE_MESSAGE =
  "We're not taking orders right now. Please check back soon or contact us.";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const settings = await getStoreSettings();
  const delivery = deliveryInfo(settings);

  const contactEmail = settings?.contact_email || SITE.email;
  const contactPhone = settings?.contact_phone || BUSINESS.phone.local;
  const instagram = settings?.instagram_url ?? SITE.instagram;
  const announcementEnabled = settings?.announcement_enabled ?? true;
  const announcement = announcementEnabled
    ? settings?.announcement_text || SITE.announcement
    : "";

  const shell = (
    <StorefrontShell
      announcement={announcement}
      contactEmail={contactEmail}
      contactPhone={contactPhone}
      instagram={instagram}
      deliveryInfo={delivery.info}
      freeDeliveryArea={delivery.freeArea}
    >
      {children}
    </StorefrontShell>
  );

  return (
    <div style={{ "--accent": ACCENT, "--accent-ink": ACCENT_INK } as CSSProperties}>
      {settings?.maintenance_mode ? (
        <MaintenanceGate
          message={MAINTENANCE_MESSAGE}
          contactEmail={contactEmail}
          contactPhone={contactPhone}
          instagram={instagram}
        >
          {shell}
        </MaintenanceGate>
      ) : (
        shell
      )}
    </div>
  );
}
