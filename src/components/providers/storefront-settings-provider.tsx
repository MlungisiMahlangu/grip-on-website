"use client";

import { createContext, useContext, type ReactNode } from "react";
import { BUSINESS } from "@/lib/business";
import { SITE } from "@/lib/site";

type StorefrontSettings = {
  contactEmail: string;
  contactPhone: string;
  instagram: string | null;
  deliveryInfo: string;
  freeDeliveryArea: string;
};

const StorefrontSettingsContext = createContext<StorefrontSettings>({
  contactEmail: SITE.email,
  contactPhone: BUSINESS.phone.local,
  instagram: SITE.instagram,
  deliveryInfo: SITE.deliveryInfo,
  freeDeliveryArea: SITE.freeDeliveryArea,
});

export function StorefrontSettingsProvider({
  contactEmail,
  contactPhone,
  instagram,
  deliveryInfo,
  freeDeliveryArea,
  children,
}: {
  contactEmail: string;
  contactPhone: string;
  instagram: string | null;
  deliveryInfo: string;
  freeDeliveryArea: string;
  children: ReactNode;
}) {
  return (
    <StorefrontSettingsContext.Provider
      value={{ contactEmail, contactPhone, instagram, deliveryInfo, freeDeliveryArea }}
    >
      {children}
    </StorefrontSettingsContext.Provider>
  );
}

export function useStorefrontSettings() {
  return useContext(StorefrontSettingsContext);
}
