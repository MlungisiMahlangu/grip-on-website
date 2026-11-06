"use client";

import { useActionState, useState } from "react";
import { saveSettingsAction } from "@/lib/admin/settings-actions";
import type { FormState } from "@/lib/admin/schemas";
import type { AdminSettings, StoreSettings } from "@/lib/supabase/types";
import { buttonClasses } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/form-field";
import { CheckCircle2 } from "lucide-react";

const initialState: FormState = {};

const DEFAULT_ACCENT = "#FF6A00";

export function SettingsForm({
  settings,
  admin,
}: {
  settings: StoreSettings | null;
  admin: AdminSettings | null;
}) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, initialState);
  const [accent, setAccent] = useState(settings?.accent_hex ?? DEFAULT_ACCENT);
  const [maintenance, setMaintenance] = useState(settings?.maintenance_mode ?? false);

  return (
    <form action={formAction} className="space-y-6">
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

      <section className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-4 sm:p-5">
        <h2 className="eyebrow text-bone">Storefront</h2>
        <p className="mt-1 text-xs leading-relaxed text-bone-dim">
          Shown across every storefront page. Changes go live on the next request.
        </p>

        <div className="mt-5">
          <TextField
            label="Announcement bar"
            name="announcementText"
            defaultValue={settings?.announcement_text ?? "Free delivery on orders over R800"}
            required
            maxLength={140}
            placeholder="Free delivery on orders over R800"
            error={state.fieldErrors?.announcementText}
          />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr]">
          <TextField
            label="Accent colour"
            name="accentHex"
            value={accent}
            onChange={(event) => setAccent(event.target.value.toUpperCase())}
            maxLength={7}
            required
            className="font-mono uppercase"
            hint="Six-digit hex. Used for buttons, links and highlights."
            error={state.fieldErrors?.accentHex}
            fieldClassName="sm:w-56"
          />
          <div className="flex items-end gap-3">
            <input
              type="color"
              aria-label="Pick accent colour"
              value={/^#[0-9A-Fa-f]{6}$/.test(accent) ? accent : DEFAULT_ACCENT}
              onChange={(event) => setAccent(event.target.value.toUpperCase())}
              className="h-11 w-20 cursor-pointer rounded-[var(--radius-card)] border border-line bg-ink-soft p-1"
            />
            <div
              aria-hidden="true"
              className="flex h-11 flex-1 items-center justify-center rounded-[var(--radius-card)] text-sm font-medium"
              style={{ background: accent, color: "#0A0A0A" }}
            >
              Preview
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-4 sm:p-5">
        <h2 className="eyebrow text-bone">Delivery</h2>
        <p className="mt-1 text-xs leading-relaxed text-bone-dim">
          Applied to the discounted subtotal at checkout.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            label="Free delivery from"
            name="freeDeliveryThreshold"
            type="text"
            inputMode="decimal"
            defaultValue={
              settings ? (settings.free_delivery_threshold_cents / 100).toFixed(0) : "800"
            }
            required
            placeholder="800"
            hint="Rand subtotal that unlocks free delivery."
            error={state.fieldErrors?.thresholdCents}
          />
          <TextField
            label="Delivery fee"
            name="deliveryFee"
            type="text"
            inputMode="decimal"
            defaultValue={settings ? (settings.delivery_fee_cents / 100).toFixed(0) : "99"}
            required
            placeholder="99"
            hint="Charged below the threshold."
            error={state.fieldErrors?.feeCents}
          />
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-4 sm:p-5">
        <h2 className="eyebrow text-bone">Contact</h2>
        <p className="mt-1 text-xs leading-relaxed text-bone-dim">
          Used in the footer, contact page and order emails.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            label="Email address"
            name="contactEmail"
            type="email"
            inputMode="email"
            defaultValue={settings?.contact_email ?? "hello@griponwear.co.za"}
            required
            placeholder="hello@example.co.za"
            error={state.fieldErrors?.contactEmail}
          />
          <TextField
            label="Instagram link"
            name="instagramUrl"
            type="url"
            inputMode="url"
            defaultValue={settings?.instagram_url ?? ""}
            placeholder="https://www.instagram.com/…"
            hint="Full link, or leave blank to hide the footer link."
            error={state.fieldErrors?.instagramUrl}
          />
        </div>

        <div className="mt-5">
          <TextField
            label="WhatsApp number"
            name="whatsappNumber"
            type="tel"
            inputMode="tel"
            defaultValue={admin?.whatsapp_number ?? ""}
            placeholder="+27 82 000 0000"
            hint="Stored for order follow-ups. Never shown outside the admin area."
            error={state.fieldErrors?.whatsappNumber}
          />
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-4 sm:p-5">
        <h2 className="eyebrow text-bone">Maintenance</h2>
        <p className="mt-1 text-xs leading-relaxed text-bone-dim">
          Pauses the storefront and blocks new orders. Admin pages stay available.
        </p>

        <div className="mt-5">
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border border-line px-3 py-2.5 has-[:checked]:border-accent/50 has-[:checked]:bg-accent/5">
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={maintenance}
              onChange={(event) => setMaintenance(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--accent)]"
            />
            <span>
              <span className="block text-sm text-bone">Maintenance mode</span>
              <span className="mt-0.5 block text-xs text-bone-dim">
                Visitors see the maintenance message instead of the shop.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-5">
          <TextAreaField
            label="Maintenance message"
            name="maintenanceMessage"
            defaultValue={settings?.maintenance_message ?? "We are making some changes. Check back shortly."}
            required
            maxLength={300}
            error={state.fieldErrors?.maintenanceMessage}
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-2 border-t border-line pt-6">
        <button type="submit" disabled={pending} className={buttonClasses("primary")}>
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
