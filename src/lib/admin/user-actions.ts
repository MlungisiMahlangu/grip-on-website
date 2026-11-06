"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "@/lib/zod-config";
import { assertAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { inviteAdminSchema, roleSchema, type FormState } from "@/lib/admin/schemas";

export async function setUserRoleAction(formData: FormData) {
  const session = await assertAdmin();

  const parsed = z
    .object({ id: z.uuid(), role: roleSchema })
    .safeParse({
      id: String(formData.get("id") ?? ""),
      role: String(formData.get("role") ?? ""),
    });

  if (!parsed.success) throw new Error("Invalid role update.");

  if (parsed.data.id === session.userId && parsed.data.role !== "admin") {
    redirect("/admin/users?error=self");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  redirect("/admin/users?updated=1");
}

export async function inviteAdminAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await assertAdmin();
  } catch {
    return { error: "Admin access required." };
  }

  const parsed = inviteAdminSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
  });

  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "email");
    return {
      error: parsed.error.issues[0]?.message ?? "Check the invite details.",
      fieldErrors: { [field]: parsed.error.issues[0]?.message ?? "Check this field." },
    };
  }

  const email = parsed.data.email.toLowerCase();
  const fullName = parsed.data.fullName || null;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (existing) {
    return {
      error: "That email already has an account. Promote them from the team list.",
      fieldErrors: { email: "That email already has an account." },
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/accept-invite`,
    data: fullName ? { full_name: fullName } : undefined,
  });

  if (error) {
    return {
      error: `Invite not sent: ${error.message}`,
    };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { error: "The invite was sent but the account could not be prepared. Refresh the list." };
  }

  const { error: promoteError } = await admin.from("profiles").upsert(
    { id: userId, email, full_name: fullName, role: "admin" },
    { onConflict: "id" },
  );

  if (promoteError) {
    return {
      error: `Invite sent, but admin access not granted: ${promoteError.message}`,
    };
  }

  revalidatePath("/admin/users");
  return { success: `Invited ${email}. The link opens /accept-invite to set a password.` };
}
