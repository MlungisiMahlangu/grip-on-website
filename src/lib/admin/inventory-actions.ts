"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { stockSchema } from "@/lib/admin/schemas";

export type StockState = {
  error?: string;
  success?: string;
};

export async function saveStockAction(
  _previous: StockState,
  formData: FormData,
): Promise<StockState> {
  try {
    await assertAdmin();
  } catch {
    return { error: "Admin access required." };
  }

  const parsed = stockSchema.safeParse({
    variantId: formData.get("variantId"),
    stock: formData.get("stock"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid stock count." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("product_variants")
    .update({ stock_quantity: parsed.data.stock })
    .eq("id", parsed.data.variantId);

  if (error) return { error: error.message };

  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/shop");

  return { success: "Saved." };
}
