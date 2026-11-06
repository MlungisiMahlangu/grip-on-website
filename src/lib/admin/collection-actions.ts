"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { collectionInputSchema, slugify, type FormState } from "@/lib/admin/schemas";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

function revalidateCollections() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/collections/[slug]", "page");
  revalidatePath("/admin/collections");
  revalidatePath("/admin/products");
}

export async function saveCollectionAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await assertAdmin();
  } catch {
    return { error: "Admin access required." };
  }

  const rawId = text(formData, "id");
  const id = rawId || null;
  if (id && !z.uuid().safeParse(id).success) {
    return { error: "That collection could not be found." };
  }

  const parsed = collectionInputSchema.safeParse({
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
    imagePath: text(formData, "imagePath"),
    sortOrder: text(formData, "sortOrder") || "0",
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.name);

  if (!slug) {
    return { error: "Enter a URL slug.", fieldErrors: { slug: "Enter a URL slug." } };
  }

  const values = {
    name: data.name,
    slug,
    description: data.description || null,
    image_path: data.imagePath || null,
    sort_order: data.sortOrder,
    is_active: data.isActive,
  };

  const supabase = await createClient();

  if (!id) {
    const { error } = await supabase.from("collections").insert(values);
    if (error) {
      return error.code === "23505"
        ? { error: "That slug is already used.", fieldErrors: { slug: "That slug is already used." } }
        : { error: error.message };
    }
  } else {
    const { error } = await supabase.from("collections").update(values).eq("id", id);
    if (error) {
      return error.code === "23505"
        ? { error: "That slug is already used.", fieldErrors: { slug: "That slug is already used." } }
        : { error: error.message };
    }
  }

  revalidateCollections();
  if (id) revalidatePath(`/admin/collections/${id}`);
  redirect("/admin/collections?saved=1");
}

export async function toggleCollectionActiveAction(formData: FormData) {
  await assertAdmin();

  const parsed = z
    .object({ id: z.uuid(), value: z.boolean() })
    .safeParse({ id: text(formData, "id"), value: formData.get("value") === "true" });

  if (!parsed.success) throw new Error("Invalid collection update.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("collections")
    .update({ is_active: parsed.data.value })
    .eq("id", parsed.data.id);

  if (error) throw new Error(error.message);

  revalidateCollections();
  revalidatePath(`/admin/collections/${parsed.data.id}`);
}
