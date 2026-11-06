import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import type { Database } from "./types";

let cached: SupabaseClient<Database> | null = null;

export function createClient(): SupabaseClient<Database> {
  if (!cached) {
    const env = publicEnv();
    cached = createBrowserClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }

  return cached;
}
