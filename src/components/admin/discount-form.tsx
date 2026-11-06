"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveDiscountAction } from "@/lib/admin/discount-actions";
import { DISCOUNT_KINDS, DISCOUNT_KIND_LABELS, type FormState } from "@/lib/admin/schemas";
import { toSastInputValue } from "@/lib/admin/dates";
import type { DiscountCode, DiscountKind } from "@/lib/supabase/types";
import { buttonClasses } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/form-field";

const initialState: FormState = {};

function displayValue(discount?: DiscountCode) {
  if (!discount) return "";
  return discount.kind === "percent" ? String(discount.value) : (discount.value / 100).toFixed(2);
}

export function DiscountForm({ discount }: { discount?: DiscountCode }) {
  const [state, formAction, pending] = useActionState(saveDiscountAction, initialState);
  const [kind, setKind] = useState<DiscountKind>(discount?.kind ?? "percent");
  const [active, setActive] = useState(discount?.is_active ?? true);

  const valueHint =
    kind === "percent"
      ? "A whole number from 1 to 100. Applied to the bag subtotal."
      : "Rand amount off the bag subtotal, e.g. 150 or 150.00.";

  return (
    <form action={formAction} className="space-y-6">
      {discount ? <input type="hidden" name="id" value={discount.id} /> : null}

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
            label="Code"
            name="code"
            defaultValue={discount?.code ?? ""}
            required
            maxLength={30}
            placeholder="GRIP10"
            className="font-mono uppercase"
            hint="Letters, numbers, hyphens and underscores. Stored in capitals."
            error={state.fieldErrors?.code}
          />
          <TextField
            label="Description (optional)"
            name="description"
            defaultValue={discount?.description ?? ""}
            maxLength={200}
            placeholder="Launch week offer"
            error={state.fieldErrors?.description}
          />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Type"
            name="kind"
            value={kind}
            onChange={(event) => setKind(event.target.value as DiscountKind)}
            error={state.fieldErrors?.kind}
          >
            {DISCOUNT_KINDS.map((option) => (
              <option key={option} value={option}>
                {DISCOUNT_KIND_LABELS[option]}
              </option>
            ))}
          </SelectField>
          <TextField
            label={kind === "percent" ? "Percentage off" : "Rand off"}
            name="value"
            type="text"
            inputMode="decimal"
            defaultValue={displayValue(discount)}
            required
            placeholder={kind === "percent" ? "10" : "150.00"}
            hint={valueHint}
            error={state.fieldErrors?.value}
          />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            label="Minimum spend (optional)"
            name="minSubtotal"
            type="text"
            inputMode="decimal"
            defaultValue={
              discount && discount.min_subtotal_cents > 0
                ? (discount.min_subtotal_cents / 100).toFixed(2)
                : ""
            }
            placeholder="500"
            hint="Rand subtotal required before the code applies."
            error={state.fieldErrors?.minSubtotalCents}
          />
          <TextField
            label="Maximum redemptions (optional)"
            name="maxRedemptions"
            type="number"
            min={1}
            max={999999}
            defaultValue={discount?.max_redemptions ?? ""}
            placeholder="Unlimited"
            hint="Leave blank for unlimited use."
            error={state.fieldErrors?.maxRedemptions}
          />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            label="Starts (optional)"
            name="startsAt"
            type="datetime-local"
            defaultValue={toSastInputValue(discount?.starts_at)}
            hint="South African time."
            error={state.fieldErrors?.startsAt}
          />
          <TextField
            label="Ends (optional)"
            name="endsAt"
            type="datetime-local"
            defaultValue={toSastInputValue(discount?.ends_at)}
            hint="South African time."
            error={state.fieldErrors?.endsAt}
          />
        </div>

        <div className="mt-5">
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
                Inactive codes are rejected at checkout even inside the date window.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line pt-6">
        <button type="submit" disabled={pending} className={buttonClasses("primary")}>
          {pending ? "Saving…" : discount ? "Save discount" : "Create discount"}
        </button>
        <Link href="/admin/discounts" className={buttonClasses("secondary")}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
