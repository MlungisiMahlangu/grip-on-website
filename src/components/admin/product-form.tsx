"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { saveProductAction } from "@/lib/admin/product-actions";
import {
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
  type FormState,
} from "@/lib/admin/schemas";
import type { Collection, Product } from "@/lib/supabase/types";
import { buttonClasses } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/form-field";
import { AdminPanel } from "@/components/admin/ui";

const initialState: FormState = {};

function rands(cents: number | null) {
  if (cents === null) return "";
  return (cents / 100).toFixed(2).replace(/\.00$/, "");
}

function Checkbox({
  name,
  label,
  hint,
  defaultChecked,
  value,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
  value?: string;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border border-line px-3 py-2.5 transition-colors has-[:checked]:border-accent/50 has-[:checked]:bg-accent/5 hover:border-line-strong">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
      />
      <span>
        <span className="block text-sm text-bone">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs leading-relaxed text-bone-dim">{hint}</span> : null}
      </span>
    </label>
  );
}

export function ProductForm({
  product,
  collections,
  selectedCollectionIds,
  saved,
}: {
  product?: Product;
  collections: Collection[];
  selectedCollectionIds: string[];
  saved?: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveProductAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      {saved ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-[var(--radius-card)] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Product saved.
        </p>
      ) : null}

      {state.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-card)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm leading-relaxed text-red-300"
        >
          {state.error}
        </p>
      ) : null}

      <AdminPanel title="Basics">
        <div className="grid gap-5 px-4 py-5 sm:px-5">
          <TextField
            label="Name"
            name="name"
            defaultValue={product?.name ?? ""}
            required
            maxLength={80}
            error={state.fieldErrors?.name}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="URL slug"
              name="slug"
              defaultValue={product?.slug ?? ""}
              placeholder="classic-tee"
              hint="Leave blank to generate from the name."
              error={state.fieldErrors?.slug}
            />
            <TextField
              label="Sort order"
              name="sortOrder"
              type="number"
              min={0}
              max={9999}
              defaultValue={product?.sort_order ?? 0}
              hint="Lower numbers appear first."
              error={state.fieldErrors?.sortOrder}
            />
          </div>
          <TextField
            label="Tagline"
            name="tagline"
            defaultValue={product?.tagline ?? ""}
            maxLength={140}
            placeholder="Everyday training tee built to move."
            error={state.fieldErrors?.tagline}
          />
          <TextAreaField
            label="Description"
            name="description"
            rows={4}
            maxLength={4000}
            defaultValue={product?.description ?? ""}
            error={state.fieldErrors?.description}
          />
          <TextAreaField
            label="Details"
            name="details"
            rows={6}
            maxLength={4000}
            defaultValue={(product?.details ?? []).join("\n")}
            hint="One detail per line. These appear as the product's feature list."
            error={state.fieldErrors?.details}
          />
        </div>
      </AdminPanel>

      <AdminPanel title="Pricing & type">
        <div className="grid gap-5 px-4 py-5 sm:grid-cols-2 sm:px-5">
          <TextField
            label="Price (R)"
            name="price"
            type="text"
            inputMode="decimal"
            defaultValue={product ? rands(product.price_cents) : ""}
            placeholder="349"
            required
            error={state.fieldErrors?.priceCents}
          />
          <TextField
            label="Compare-at price (R)"
            name="compareAtPrice"
            type="text"
            inputMode="decimal"
            defaultValue={rands(product?.compare_at_price_cents ?? null)}
            placeholder="Optional"
            hint="Leave blank when the product is not on sale."
            error={state.fieldErrors?.compareAtPriceCents}
          />
          <SelectField
            label="Product type"
            name="productType"
            defaultValue={product?.product_type ?? "tee"}
            error={state.fieldErrors?.productType}
          >
            {PRODUCT_TYPES.map((type) => (
              <option key={type} value={type}>
                {PRODUCT_TYPE_LABELS[type]}
              </option>
            ))}
          </SelectField>
          <div className="grid gap-2 sm:grid-cols-2">
            <Checkbox
              name="isActive"
              label="Active"
              hint="Visible in the store."
              defaultChecked={product?.is_active ?? true}
            />
            <Checkbox
              name="isFeatured"
              label="Featured"
              hint="Shown on the homepage."
              defaultChecked={product?.is_featured ?? false}
            />
          </div>
        </div>
      </AdminPanel>

      <AdminPanel title="Collections">
        <div className="px-4 py-5 sm:px-5">
          {collections.length === 0 ? (
            <p className="text-sm text-bone-dim">
              No collections yet.{" "}
              <Link href="/admin/collections" className="text-accent hover:text-bone">
                Create one first.
              </Link>
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <Checkbox
                  key={collection.id}
                  name="collectionIds"
                  value={collection.id}
                  label={collection.name}
                  hint={collection.is_active ? collection.slug : `${collection.slug} · archived`}
                  defaultChecked={selectedCollectionIds.includes(collection.id)}
                />
              ))}
            </div>
          )}
        </div>
      </AdminPanel>

      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={pending} className={buttonClasses("primary")}>
            {pending ? "Saving…" : product ? "Save product" : "Create product"}
          </button>
          <Link href="/admin/products" className={buttonClasses("secondary")}>
            {product ? "Back to products" : "Cancel"}
          </Link>
        </div>
        {product ? (
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:text-bone"
          >
            View on store
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </form>
  );
}
