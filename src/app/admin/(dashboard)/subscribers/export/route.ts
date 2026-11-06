import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

function cell(value: string | boolean | null) {
  const text = value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  try {
    await assertAdmin();
  } catch {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const query = url.searchParams.get("q")?.trim().slice(0, 80) ?? "";

  const supabase = await createClient();
  let select = supabase
    .from("subscribers")
    .select("email, source, is_active, created_at, unsubscribed_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (status === "active") select = select.eq("is_active", true);
  if (status === "inactive") select = select.eq("is_active", false);
  if (query) select = select.ilike("email", `%${query}%`);

  const { data, error } = await select;
  if (error) return new NextResponse(error.message, { status: 500 });

  const rows = [
    ["email", "source", "status", "subscribed_at", "unsubscribed_at"].join(","),
    ...(data ?? []).map((row) =>
      [
        cell(row.email),
        cell(row.source),
        cell(row.is_active ? "subscribed" : "unsubscribed"),
        cell(row.created_at),
        cell(row.unsubscribed_at),
      ].join(","),
    ),
  ];

  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg" }).format(
    new Date(),
  );

  return new NextResponse(rows.join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="grip-on-subscribers-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
}
