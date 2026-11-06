"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { messageStatusSchema } from "@/lib/admin/schemas";

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
