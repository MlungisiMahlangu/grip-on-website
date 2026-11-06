"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveCollectionAction } from "@/lib/admin/collection-actions";
import { slugify, type FormState } from "@/lib/admin/schemas";
import type { Collection } from "@/lib/supabase/types";
import { buttonClasses } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/form-field";
import { SingleImageField } from "@/components/admin/image-uploader";

const initialState: FormState = {};

export function CollectionForm({ collection }: { collection?: Collection }) {
  const [state, formAction, pending] = useActionState(saveCollectionAction, initialState);
  const [name, setName] = useState(collection?.name ?? "");
  const [slug, setSlug] = useState(collection?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(collection));
  const [active, setActive] = useState(collection?.is_active ?? true);

  return (
    <form action={formAction} className="space-y-6">
      {collection ? <input type="hidden" name="id" value={collection.id} /> : null}

      {state.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-card)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm leading-relaxed text-red-300"
        >
          {state.error}
        </p>
      ) : null}

      <div className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-4 sm:p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Name"
            name="name"
            value={name}
            onChange={(event) => {
              const value = event.target.value;
              setName(value);
              if (!slugTouched) setSlug(slugify(value));
            }}
            required
            maxLength={60}
            placeholder="New Arrivals"
            error={state.fieldErrors?.name}
          />
          <TextField
            label="URL slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            required
            maxLength={80}
            placeholder="new-arrivals"
            error={state.fieldErrors?.slug}
          />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextAreaField
            label="Description"
            name="description"
            rows={3}
            maxLength={600}
            defaultValue={collection?.description ?? ""}
            hint="Shown at the top of the collection page."
            error={state.fieldErrors?.description}
          />
          <div className="space-y-4">
            <TextField
              label="Sort order"
              name="sortOrder"
              type="number"
              min={0}
              max={9999}
              defaultValue={collection?.sort_order ?? 0}
              hint="Lower numbers appear first in navigation."
              error={state.fieldErrors?.sortOrder}
            />
            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border border-line px-3 py-2.5 has-[:checked]:border-accent/50 has-[:checked]:bg-accent/5">
              <input
                type="checkbox"
                name="isActive"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[var(--accent)]"
              />
              <span>
                <span className="block text-sm text-bone">Active</span>
                <span className="mt-0.5 block text-xs text-bone-dim">
                  Visible in the store and navigation.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="mt-5">
          <SingleImageField
            label="Collection image"
            name="imagePath"
            folder={`collections/${slug || "collection"}`}
            defaultValue={collection?.image_path ?? ""}
            hint="Optional. Falls back to the first product image."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line pt-6">
        <button type="submit" disabled={pending} className={buttonClasses("primary")}>
          {pending ? "Saving…" : collection ? "Save collection" : "Create collection"}
        </button>
        <Link href="/admin/collections" className={buttonClasses("secondary")}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
