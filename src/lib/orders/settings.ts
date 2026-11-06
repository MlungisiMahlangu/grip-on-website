import "server-only";

import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import type { StoreSettings } from "@/lib/supabase/types";
import { SITE } from "@/lib/site";

export const getStoreSettings = cache(async (): Promise<StoreSettings | null> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  if (error) return null;
  return data;
});

export function deliveryInfo(settings: StoreSettings | null) {
  return {
    info: settings?.delivery_info_text || SITE.deliveryInfo,
    freeArea: settings?.free_delivery_area || SITE.freeDeliveryArea,
  };
}
