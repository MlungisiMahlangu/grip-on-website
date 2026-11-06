import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const supabase = await createClient();

  const [unviewedOrders, newMessages] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .is("admin_viewed_at", null),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  let orders = unviewedOrders.count ?? 0;

  if (unviewedOrders.error) {
    const fallback = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    orders = fallback.count ?? 0;
  }

  return NextResponse.json({
    orders,
    messages: newMessages.error ? 0 : (newMessages.count ?? 0),
  });
}
