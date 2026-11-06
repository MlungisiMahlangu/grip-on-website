import { timingSafeEqual } from "node:crypto";
import { createPublicClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function tokenMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const expectedToken = process.env.KEEP_ALIVE_TOKEN;

  if (expectedToken) {
    const header = request.headers.get("authorization") ?? "";
    const provided = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!tokenMatches(provided, expectedToken)) {
      return Response.json(
        { ok: false, error: "Unauthorized" },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  const supabase = createPublicClient();
  const { error } = await supabase.from("settings").select("id").eq("id", true).maybeSingle();

  if (error) {
    return Response.json(
      { ok: false, error: "Database ping failed" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    { ok: true, checkedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
