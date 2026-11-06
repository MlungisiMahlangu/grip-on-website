"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import {
  colourInputSchema,
  parseDetails,
  productInputSchema,
  sizeOptionsForType,
  slugify,
  type FormState,
} from "@/lib/admin/schemas";

function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/search");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/collections/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
}

async function requireAdminOrError() {
  try {
    await assertAdmin();
    return null;
  } catch {
    return { error: "Admin access required." } satisfies FormState;
  }
}

export async function saveProductAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await requireAdminOrError();
  if (denied) return denied;

  const rawId = text(formData, "id");
  const id = rawId || null;

  if (id && !z.uuid().safeParse(id).success) {
    return { error: "That product could not be found." };
  }

  const parsed = productInputSchema.safeParse({
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    tagline: text(formData, "tagline"),
    description: text(formData, "description"),
    details: text(formData, "details"),
    priceCents: text(formData, "price"),
    compareAtPriceCents: text(formData, "compareAtPrice"),
    productType: text(formData, "productType"),
    sortOrder: text(formData, "sortOrder") || "0",
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    collectionIds: formData.getAll("collectionIds").map(String).filter(Boolean),
  });

  if (!parsed.success) {
    return { error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.name);

  if (!slug) {
    return { error: "Enter a URL slug.", fieldErrors: { slug: "Enter a URL slug." } };
  }

  if (
    data.compareAtPriceCents !== null &&
    data.compareAtPriceCents <= data.priceCents
  ) {
    return {
      error: "Check the highlighted fields.",
      fieldErrors: {
        compareAtPriceCents: "The compare-at price must be higher than the price.",
      },
    };
  }

  const supabase = await createClient();
  const values = {
    name: data.name,
    slug,
    tagline: data.tagline || null,
    description: data.description || null,
    details: parseDetails(data.details),
    price_cents: data.priceCents,
    compare_at_price_cents: data.compareAtPriceCents,
    product_type: data.productType,
    is_active: data.isActive,
    is_featured: data.isFeatured,
    sort_order: data.sortOrder,
  };

  let productId = id;

  if (!productId) {
    const { data: created, error } = await supabase
      .from("products")
      .insert(values)
      .select("id")
      .single();

    if (error) {
      return error.code === "23505"
        ? { error: "That slug is already used by another product.", fieldErrors: { slug: "That slug is already used." } }
        : { error: error.message };
    }

    productId = created.id;
  } else {
    const { error } = await supabase.from("products").update(values).eq("id", productId);
    if (error) {
      return error.code === "23505"
        ? { error: "That slug is already used by another product.", fieldErrors: { slug: "That slug is already used." } }
        : { error: error.message };
    }
  }

  const { error: clearError } = await supabase
    .from("product_collections")
    .delete()
    .eq("product_id", productId);

  if (clearError) return { error: `Collections not updated: ${clearError.message}` };

  if (data.collectionIds.length > 0) {
    const { error: linkError } = await supabase.from("product_collections").insert(
      data.collectionIds.map((collectionId) => ({
        product_id: productId,
        collection_id: collectionId,
      })),
    );
    if (linkError) return { error: `Collections not updated: ${linkError.message}` };
  }

  revalidateStorefront();
  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}?saved=1`);
}

export async function toggleProductFlagAction(formData: FormData) {
  await assertAdmin();

  const id = text(formData, "id");
  const flag = text(formData, "flag");
  const parsed = z
    .object({
      id: z.uuid(),
      flag: z.enum(["is_active", "is_featured"]),
      value: z.boolean(),
    })
    .safeParse({
      id,
      flag,
      value: formData.get("value") === "true",
    });

  if (!parsed.success) throw new Error("Invalid product update.");

  const supabase = await createClient();
  const update =
    parsed.data.flag === "is_active"
      ? { is_active: parsed.data.value }
      : { is_featured: parsed.data.value };
  const { error } = await supabase.from("products").update(update).eq("id", parsed.data.id);

  if (error) throw new Error(error.message);

  revalidateStorefront();
  revalidatePath(`/admin/products/${parsed.data.id}`);
}

export async function saveColourAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await requireAdminOrError();
  if (denied) return denied;

  const rawId = text(formData, "id");
  const id = rawId || null;
  if (id && !z.uuid().safeParse(id).success) {
    return { error: "That colour could not be found." };
  }

  let gallery: string[] = [];
  try {
    const value = JSON.parse(text(formData, "galleryPaths") || "[]");
    gallery = Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  } catch {
    gallery = [];
  }

  const parsed = colourInputSchema.safeParse({
    productId: text(formData, "productId"),
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    hex: text(formData, "hex"),
    frontImagePath: text(formData, "frontImagePath"),
    backImagePath: text(formData, "backImagePath"),
    galleryPaths: gallery,
    sortOrder: text(formData, "sortOrder") || "0",
  });

  if (!parsed.success) {
    return { error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, slug, product_type")
    .eq("id", data.productId)
    .maybeSingle();

  if (productError) return { error: productError.message };
  if (!product) return { error: "That product no longer exists." };

  const values = {
    name: data.name,
    slug: data.slug,
    hex: data.hex,
    front_image_path: data.frontImagePath || null,
    back_image_path: data.backImagePath || null,
    gallery_paths: data.galleryPaths.filter(Boolean),
    sort_order: data.sortOrder,
  };

  let colourId = id;

  if (!colourId) {
    const { data: created, error } = await supabase
      .from("product_colours")
      .insert({ ...values, product_id: product.id, is_active: true })
      .select("id")
      .single();

    if (error) {
      return error.code === "23505"
        ? {
            error: "That colour slug is already used on this product.",
            fieldErrors: { slug: "That slug is already used on this product." },
          }
        : { error: error.message };
    }

    colourId = created.id;
  } else {
    const { error } = await supabase.from("product_colours").update(values).eq("id", colourId);
    if (error) {
      return error.code === "23505"
        ? {
            error: "That colour slug is already used on this product.",
            fieldErrors: { slug: "That slug is already used on this product." },
          }
        : { error: error.message };
    }
  }

  const sizes = sizeOptionsForType(product.product_type);
  const { data: existing, error: existingError } = await supabase
    .from("product_variants")
    .select("id, size")
    .eq("colour_id", colourId);

  if (existingError) return { error: `Variants not loaded: ${existingError.message}` };

  const existingBySize = new Map((existing ?? []).map((variant) => [variant.size, variant.id]));
  const skuBase = `GO-${product.slug.toUpperCase()}-${data.slug.toUpperCase()}`;

  for (const size of sizes) {
    const stockValue = text(formData, `stock_${size}`);
    const stock = Math.max(0, Math.min(100000, Number.parseInt(stockValue || "0", 10) || 0));
    const sizeCode = size === "ONE_SIZE" ? "OS" : size;
    const existingId = existingBySize.get(size);

    if (existingId) {
      const { error } = await supabase
        .from("product_variants")
        .update({ stock_quantity: stock })
        .eq("id", existingId);
      if (error) return { error: `Stock not saved: ${error.message}` };
    } else {
      const { error } = await supabase.from("product_variants").insert({
        product_id: product.id,
        colour_id: colourId,
        size,
        sku: `${skuBase}-${sizeCode}`,
        stock_quantity: stock,
      });
      if (error) return { error: `Variant not created: ${error.message}` };
    }
  }

  revalidateStorefront();
  revalidatePath(`/admin/products/${product.id}`);

  return { success: id ? "Colour saved." : "Colour added." };
}

export async function setColourActiveAction(formData: FormData) {
  await assertAdmin();

  const parsed = z
    .object({ id: z.uuid(), productId: z.uuid(), value: z.boolean() })
    .safeParse({
      id: text(formData, "id"),
      productId: text(formData, "productId"),
      value: formData.get("value") === "true",
    });

  if (!parsed.success) throw new Error("Invalid colour update.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("product_colours")
    .update({ is_active: parsed.data.value })
    .eq("id", parsed.data.id);

  if (error) throw new Error(error.message);

  revalidateStorefront();
  revalidatePath(`/admin/products/${parsed.data.productId}`);
}
