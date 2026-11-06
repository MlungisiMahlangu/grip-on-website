import type { CSSProperties, ReactNode } from "react";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { MaintenanceGate } from "@/components/layout/maintenance-gate";
import { deliveryPricing, getStoreSettings } from "@/lib/orders/settings";
import { accentInk } from "@/lib/color";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const settings = await getStoreSettings();
  const { thresholdCents } = deliveryPricing(settings);

  const accent = settings?.accent_hex || "#FF6A00";
  const accentInkColor = accentInk(accent);
  const contactEmail = settings?.contact_email || SITE.email;
  const instagram = settings?.instagram_url ?? SITE.instagram;
  const announcement = settings?.announcement_text || SITE.announcement;

  const shell = (
    <StorefrontShell
      announcement={announcement}
      contactEmail={contactEmail}
      instagram={instagram}
      freeDeliveryThresholdCents={thresholdCents}
    >
      {children}
    </StorefrontShell>
  );

  return (
    <div style={{ "--accent": accent, "--accent-ink": accentInkColor } as CSSProperties}>
      {settings?.maintenance_mode ? (
        <MaintenanceGate
          message={settings.maintenance_message || "We are making some changes. Check back shortly."}
          contactEmail={contactEmail}
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
