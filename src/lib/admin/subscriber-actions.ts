"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "@/lib/zod-config";
import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export async function deleteSubscriberAction(formData: FormData) {
  await assertAdmin();

  const parsed = z.uuid().safeParse(formData.get("id"));
  if (!parsed.success) throw new Error("Invalid subscriber.");

  const supabase = await createClient();
  const { error } = await supabase.from("subscribers").delete().eq("id", parsed.data);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/subscribers");
  redirect("/admin/subscribers?deleted=1");
}
