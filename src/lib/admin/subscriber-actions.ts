"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/admin/schemas";

const emailSchema = z.email("Enter a valid email address.").trim().max(160);

export async function setSubscriberActiveAction(formData: FormData) {
  await assertAdmin();

  const parsed = z
    .object({ id: z.uuid(), value: z.boolean() })
    .safeParse({
      id: String(formData.get("id") ?? ""),
      value: formData.get("value") === "true",
    });

  if (!parsed.success) throw new Error("Invalid subscriber update.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("subscribers")
    .update({
      is_active: parsed.data.value,
      unsubscribed_at: parsed.data.value ? null : new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/subscribers");
}

export async function addSubscriberAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await assertAdmin();
  } catch {
    return { error: "Admin access required." };
  }

  const parsed = emailSchema.safeParse(String(formData.get("email") ?? ""));
  if (!parsed.success) {
    return {
      error: "Enter a valid email address.",
      fieldErrors: { email: parsed.error.issues[0]?.message ?? "Enter a valid email address." },
    };
  }

  const email = parsed.data.toLowerCase();
  const supabase = await createClient();
  const { error } = await supabase.from("subscribers").upsert(
    {
      email,
      source: "admin",
      is_active: true,
      unsubscribed_at: null,
    },
    { onConflict: "email" },
  );

  if (error) return { error: error.message };

  revalidatePath("/admin/subscribers");
  return { success: `${email} is subscribed.` };
}
