"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "@/lib/zod-config";
import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { fromSastInputValue } from "@/lib/admin/dates";
import { discountInputSchema, randsToCents, type FormState } from "@/lib/admin/schemas";

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

export async function saveDiscountAction(
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
    return { error: "That discount could not be found." };
  }

  const parsed = discountInputSchema.safeParse({
    code: text(formData, "code"),
    description: text(formData, "description"),
    kind: text(formData, "kind"),
    value: text(formData, "value"),
    minSubtotalCents: text(formData, "minSubtotal"),
    startsAt: text(formData, "startsAt"),
    endsAt: text(formData, "endsAt"),
    maxRedemptions: text(formData, "maxRedemptions"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;

  let value: number;
  if (data.kind === "percent") {
    if (!/^\d{1,3}$/.test(data.value)) {
      return {
        error: "Enter a whole percentage between 1 and 100.",
        fieldErrors: { value: "Enter a whole percentage between 1 and 100." },
      };
    }
    value = Number(data.value);
    if (value < 1 || value > 100) {
      return {
        error: "Enter a whole percentage between 1 and 100.",
        fieldErrors: { value: "Enter a whole percentage between 1 and 100." },
      };
    }
  } else {
    const cents = randsToCents(data.value);
    if (cents === null || cents < 1) {
      return {
        error: "Enter a rand amount like 150 or 150.00.",
        fieldErrors: { value: "Enter a rand amount like 150 or 150.00." },
      };
    }
    value = cents;
  }

  const startsAt = fromSastInputValue(data.startsAt);
  if (startsAt === undefined) {
    return { error: "Enter a valid start date.", fieldErrors: { startsAt: "Enter a valid start date." } };
  }

  const endsAt = fromSastInputValue(data.endsAt);
  if (endsAt === undefined) {
    return { error: "Enter a valid end date.", fieldErrors: { endsAt: "Enter a valid end date." } };
  }

  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
    return {
      error: "The end date must be after the start date.",
      fieldErrors: { endsAt: "The end date must be after the start date." },
    };
  }

  let maxRedemptions: number | null = null;
  if (data.maxRedemptions) {
    if (!/^\d{1,6}$/.test(data.maxRedemptions) || Number(data.maxRedemptions) < 1) {
      return {
        error: "Enter a whole number of redemptions, or leave it blank.",
        fieldErrors: { maxRedemptions: "Enter a whole number, or leave it blank." },
      };
    }
    maxRedemptions = Number(data.maxRedemptions);
  }

  const values = {
    code: data.code,
    description: data.description || null,
    kind: data.kind,
    value,
    min_subtotal_cents: data.minSubtotalCents ?? 0,
    starts_at: startsAt,
    ends_at: endsAt,
    max_redemptions: maxRedemptions,
    is_active: data.isActive,
  };

  const supabase = await createClient();

  if (!id) {
    const { error } = await supabase.from("discount_codes").insert(values);
    if (error) {
      return error.code === "23505"
        ? {
            error: "That code already exists.",
            fieldErrors: { code: "That code already exists." },
          }
        : { error: error.message };
    }
  } else {
    const { error } = await supabase.from("discount_codes").update(values).eq("id", id);
    if (error) {
      return error.code === "23505"
        ? {
            error: "That code already exists.",
            fieldErrors: { code: "That code already exists." },
          }
        : { error: error.message };
    }
  }

  revalidatePath("/admin/discounts");
  if (id) revalidatePath(`/admin/discounts/${id}`);
  redirect("/admin/discounts?saved=1");
}

export async function toggleDiscountActiveAction(formData: FormData) {
  await assertAdmin();

  const parsed = z
    .object({ id: z.uuid(), value: z.boolean() })
    .safeParse({ id: text(formData, "id"), value: formData.get("value") === "true" });

  if (!parsed.success) throw new Error("Invalid discount update.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("discount_codes")
    .update({ is_active: parsed.data.value })
    .eq("id", parsed.data.id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/discounts");
  revalidatePath(`/admin/discounts/${parsed.data.id}`);
}
