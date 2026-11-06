"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SITE } from "@/lib/site";

type StorefrontSettings = {
  freeDeliveryThresholdCents: number;
  contactEmail: string;
  instagram: string | null;
};

const StorefrontSettingsContext = createContext<StorefrontSettings>({
  freeDeliveryThresholdCents: SITE.freeDeliveryThreshold * 100,
  contactEmail: SITE.email,
  instagram: SITE.instagram,
});

export function StorefrontSettingsProvider({
  freeDeliveryThresholdCents,
  contactEmail,
  instagram,
  children,
}: {
  freeDeliveryThresholdCents: number;
  contactEmail: string;
  instagram: string | null;
  children: ReactNode;
}) {
  return (
    <StorefrontSettingsContext.Provider
      value={{ freeDeliveryThresholdCents, contactEmail, instagram }}
    >
      {children}
    </StorefrontSettingsContext.Provider>
  );
}

export function useStorefrontSettings() {
  return useContext(StorefrontSettingsContext);
}
