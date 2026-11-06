"use server";

import { revalidatePath } from "next/cache";
import { z } from "@/lib/zod-config";
import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { settingsInputSchema, type FormState } from "@/lib/admin/schemas";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

export async function saveSettingsAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await assertAdmin();
  } catch {
    return { error: "Admin access required." };
  }

  const parsed = settingsInputSchema.safeParse({
    announcementText: text(formData, "announcementText"),
    announcementEnabled: formData.get("announcementEnabled") === "on",
    deliveryInfoText: text(formData, "deliveryInfoText"),
    freeDeliveryArea: text(formData, "freeDeliveryArea"),
    contactEmail: text(formData, "contactEmail"),
    contactPhone: text(formData, "contactPhone"),
    instagramUrl: text(formData, "instagramUrl"),
    maintenanceMode: formData.get("maintenanceMode") === "on",
    businessAddress: text(formData, "businessAddress"),
    businessRegistration: text(formData, "businessRegistration"),
    whatsappNumber: text(formData, "whatsappNumber"),
  });

  if (!parsed.success) {
    return { error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const { error: settingsError } = await supabase
    .from("settings")
    .update({
      announcement_text: data.announcementText,
      announcement_enabled: data.announcementEnabled,
      delivery_info_text: data.deliveryInfoText,
      free_delivery_area: data.freeDeliveryArea,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
      instagram_url: data.instagramUrl || null,
      maintenance_mode: data.maintenanceMode,
      business_address: data.businessAddress,
      business_registration: data.businessRegistration,
    })
    .eq("id", true);

  if (settingsError) return { error: `Settings not saved: ${settingsError.message}` };

  const { error: adminError } = await supabase
    .from("admin_settings")
    .update({ whatsapp_number: data.whatsappNumber || null })
    .eq("id", true);

  if (adminError) return { error: `WhatsApp number not saved: ${adminError.message}` };

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { success: "Settings saved. The storefront picks them up immediately." };
}
