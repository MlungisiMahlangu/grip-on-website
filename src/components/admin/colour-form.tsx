"use client";

import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { saveColourAction } from "@/lib/admin/product-actions";
import { sizeOptionsForType, slugify, type FormState } from "@/lib/admin/schemas";
import type { AdminColour } from "@/lib/admin/queries";
import { buttonClasses } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-field";
import { GalleryField, SingleImageField } from "@/components/admin/image-uploader";

const initialState: FormState = {};

export function ColourForm({
  productId,
  productSlug,
  productType,
  colour,
}: {
  productId: string;
  productSlug: string;
  productType: string;
  colour?: AdminColour;
}) {
  const [state, formAction, pending] = useActionState(saveColourAction, initialState);
  const [name, setName] = useState(colour?.name ?? "");
  const [slug, setSlug] = useState(colour?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(colour));
  const [hex, setHex] = useState(colour?.hex ?? "#0A0A0A");
  const sizes = sizeOptionsForType(productType);
  const stockBySize = new Map(
    (colour?.variants ?? []).map((variant) => [variant.size, variant.stock_quantity]),
  );
  const folder = `products/${productSlug}/${slug || "colour"}`;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="productId" value={productId} />
      {colour ? <input type="hidden" name="id" value={colour.id} /> : null}

      {state.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-card)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm leading-relaxed text-red-300"
        >
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-[var(--radius-card)] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {state.success}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Colour name"
          name="name"
          value={name}
          onChange={(event) => {
            const value = event.target.value;
            setName(value);
            if (!slugTouched) setSlug(slugify(value));
          }}
          required
          maxLength={50}
          placeholder="Black"
          error={state.fieldErrors?.name}
        />
        <TextField
          label="Colour slug"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          required
          maxLength={80}
          placeholder="black"
          error={state.fieldErrors?.slug}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${colour?.id ?? "new"}-hex`} className="eyebrow text-bone-dim">
            Swatch colour
          </label>
          <div className="flex items-center gap-2">
            <input
              id={`${colour?.id ?? "new"}-hex`}
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#0A0A0A"}
              onChange={(event) => setHex(event.target.value.toUpperCase())}
              className="h-11 w-14 cursor-pointer rounded-[var(--radius-card)] border border-line bg-ink-soft p-1"
              aria-label="Pick swatch colour"
            />
            <input
              name="hex"
              value={hex}
              onChange={(event) => setHex(event.target.value.toUpperCase())}
              className="min-h-11 w-full rounded-[var(--radius-card)] border border-line bg-ink-soft px-3 font-mono text-sm uppercase text-bone focus:border-accent focus:outline-none"
              maxLength={7}
              aria-label="Swatch hex value"
            />
          </div>
          {state.fieldErrors?.hex ? (
            <p className="text-xs text-red-400">{state.fieldErrors.hex}</p>
          ) : (
            <p className="text-xs text-bone-dim/80">The dot shown on the product page.</p>
          )}
        </div>
        <TextField
          label="Sort order"
          name="sortOrder"
          type="number"
          min={0}
          max={9999}
          defaultValue={colour?.sort_order ?? 0}
          hint="Lower numbers appear first."
          error={state.fieldErrors?.sortOrder}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SingleImageField
          label="Front image"
          name="frontImagePath"
          folder={folder}
          defaultValue={colour?.front_image_path ?? ""}
          hint="Card front and default product image."
        />
        <SingleImageField
          label="Back image"
          name="backImagePath"
          folder={folder}
          defaultValue={colour?.back_image_path ?? ""}
          hint="Shown when a card is hovered or focused."
        />
      </div>

      <GalleryField
        label="Gallery"
        name="galleryPaths"
        folder={folder}
        defaultValue={colour?.gallery_paths ?? []}
        max={8}
        hint="Extra shots for the product gallery. Front and back are added automatically."
      />

      <div>
        <p className="eyebrow text-bone-dim">Stock by size</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {sizes.map((size) => (
            <label key={size} className="flex flex-col gap-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-bone-dim">
                {size === "ONE_SIZE" ? "One size" : size}
              </span>
              <input
                type="number"
                name={`stock_${size}`}
                min={0}
                max={100000}
                step={1}
                defaultValue={stockBySize.get(size) ?? 0}
                className="min-h-11 w-full rounded-[var(--radius-card)] border border-line bg-ink-soft px-2 text-center font-mono text-sm text-bone focus:border-accent focus:outline-none"
              />
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-bone-dim/80">
          Zero-stock sizes are hidden on the storefront. Inventory can bulk-adjust stock later.
        </p>
      </div>

      <button type="submit" disabled={pending} className={buttonClasses("primary")}>
        {pending ? "Saving…" : colour ? "Save colour" : "Add colour"}
      </button>
    </form>
  );
}
