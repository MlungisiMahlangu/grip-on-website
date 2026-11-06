import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export type AdminSession = {
  userId: string;
  email: string;
  profile: Profile;
};

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") return null;

  return {
    userId: user.id,
    email: profile.email || user.email || "",
    profile,
  };
});

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (session) return session;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/admin/login?reason=forbidden");
  redirect("/admin/login");
}

export async function assertAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error("You do not have admin access.");
  return session;
}
