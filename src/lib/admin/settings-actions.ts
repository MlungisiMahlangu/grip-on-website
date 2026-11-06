"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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
    accentHex: text(formData, "accentHex"),
    thresholdCents: text(formData, "freeDeliveryThreshold"),
    feeCents: text(formData, "deliveryFee"),
    contactEmail: text(formData, "contactEmail"),
    instagramUrl: text(formData, "instagramUrl"),
    maintenanceMode: formData.get("maintenanceMode") === "on",
    maintenanceMessage: text(formData, "maintenanceMessage"),
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
      accent_hex: data.accentHex,
      free_delivery_threshold_cents: data.thresholdCents,
      delivery_fee_cents: data.feeCents,
      contact_email: data.contactEmail,
      instagram_url: data.instagramUrl || null,
      maintenance_mode: data.maintenanceMode,
      maintenance_message: data.maintenanceMessage,
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
