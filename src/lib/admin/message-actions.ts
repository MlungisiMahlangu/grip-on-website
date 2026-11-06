"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "@/lib/zod-config";
import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { messageStatusSchema } from "@/lib/admin/schemas";

export async function markMessageReadAction(id: string) {
  try {
    await assertAdmin();
  } catch {
    return;
  }

  if (!z.uuid().safeParse(id).success) return;

  const supabase = await createClient();
  await supabase
    .from("contact_messages")
    .update({ status: "read" })
    .eq("id", id)
    .eq("status", "new");

  revalidatePath("/admin/messages");
}

export async function deleteMessageAction(formData: FormData) {
  await assertAdmin();

  const parsed = z.uuid().safeParse(formData.get("id"));
  if (!parsed.success) throw new Error("Invalid message.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", parsed.data);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/messages");
  redirect("/admin/messages?deleted=1");
}

export async function updateMessageStatusAction(formData: FormData) {
  await assertAdmin();

  const parsed = z
    .object({
      id: z.uuid(),
      status: messageStatusSchema,
    })
    .safeParse({
      id: String(formData.get("id") ?? ""),
      status: String(formData.get("status") ?? ""),
    });

  if (!parsed.success) throw new Error("Invalid message update.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${parsed.data.id}`);
  redirect(`/admin/messages/${parsed.data.id}`);
}
