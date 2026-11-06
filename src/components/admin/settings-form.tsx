"use client";

import { useActionState, useEffect, useState } from "react";
import { saveSettingsAction } from "@/lib/admin/settings-actions";
import { BUSINESS } from "@/lib/business";
import { SITE } from "@/lib/site";
import { toast } from "@/lib/toast";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import type { FormState } from "@/lib/admin/schemas";
import type { AdminSettings, StoreSettings } from "@/lib/supabase/types";
import { buttonClasses } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/form-field";

const initialState: FormState = {};

const MAINTENANCE_MESSAGE =
  "We're not taking orders right now. Please check back soon or contact us.";

export function SettingsForm({
  settings,
  admin,
}: {
  settings: StoreSettings | null;
  admin: AdminSettings | null;
}) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, initialState);
  const [announcement, setAnnouncement] = useState(
    settings?.announcement_text ?? "Free delivery in Johannesburg",
  );
  const [announcementEnabled, setAnnouncementEnabled] = useState(
    settings?.announcement_enabled ?? true,
  );
  const [maintenance, setMaintenance] = useState(settings?.maintenance_mode ?? false);
  const [dirty, setDirty] = useState(false);

  useUnsavedChanges(dirty);

  useEffect(() => {
    if (state.success) toast.success(state.success);
  }, [state.success]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form
      action={formAction}
      onChange={() => setDirty(true)}
      onSubmit={() => setDirty(false)}
      className="space-y-6"
    >
      {state.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-card)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm leading-relaxed text-red-300"
        >
          {state.error}
        </p>
      ) : null}

      <section className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-4 sm:p-5">
        <h2 className="eyebrow text-bone">Announcement</h2>
        <p className="mt-1 text-xs leading-relaxed text-bone-dim">
          The bar at the top of every storefront page. Changes go live as soon as you save.
        </p>

        <div className="mt-5">
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border border-line px-3 py-2.5 has-[:checked]:border-accent/50 has-[:checked]:bg-accent/5">
            <input
              type="checkbox"
              name="announcementEnabled"
              checked={announcementEnabled}
              onChange={(event) => setAnnouncementEnabled(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--accent)]"
            />
            <span>
              <span className="block text-sm text-bone">Show the announcement bar</span>
              <span className="mt-0.5 block text-xs text-bone-dim">
                Turn this off to hide the bar without losing the text.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-5">
          <TextField
            label="Announcement text"
            name="announcementText"
            value={announcement}
            onChange={(event) => setAnnouncement(event.target.value.slice(0, 140))}
            required
            maxLength={140}
            placeholder="Free delivery in Johannesburg"
            hint={`${announcement.length} of 140 characters`}
            error={state.fieldErrors?.announcementText}
          />
        </div>

        <div className="mt-5">
          <p className="eyebrow text-bone-dim">Preview</p>
          <div className="mt-2 overflow-hidden rounded-[var(--radius-card)] border border-line">
            {announcementEnabled ? (
              <div className="flex min-h-9 items-center justify-center gap-2.5 bg-accent px-3 text-accent-ink">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-ink" aria-hidden="true" />
                <p className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.18em]">
                  {announcement || "Your announcement"}
                </p>
              </div>
            ) : (
              <p className="bg-ink-raised px-3 py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">
                Hidden
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-4 sm:p-5">
        <h2 className="eyebrow text-bone">Delivery</h2>
        <p className="mt-1 text-xs leading-relaxed text-bone-dim">
          Shown on product pages, in the cart, at checkout and in the footer.
        </p>

        <div className="mt-5 grid gap-5">
          <TextField
            label="Free delivery area"
            name="freeDeliveryArea"
            defaultValue={settings?.free_delivery_area ?? SITE.freeDeliveryArea}
            required
            maxLength={60}
            placeholder="Johannesburg"
            hint="Orders in this area are delivered free."
            error={state.fieldErrors?.freeDeliveryArea}
          />
          <TextAreaField
            label="Delivery information"
            name="deliveryInfoText"
            defaultValue={settings?.delivery_info_text ?? SITE.deliveryInfo}
            required
            rows={3}
            maxLength={300}
            hint="Explains free delivery and how other areas are quoted."
            error={state.fieldErrors?.deliveryInfoText}
          />
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-4 sm:p-5">
        <h2 className="eyebrow text-bone">Contact</h2>
        <p className="mt-1 text-xs leading-relaxed text-bone-dim">
          Shown on the storefront, in legal pages and in order emails.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            label="Phone and WhatsApp"
            name="contactPhone"
            type="tel"
            inputMode="tel"
            defaultValue={settings?.contact_phone ?? BUSINESS.phone.local}
            required
            maxLength={10}
            placeholder="0660000000"
            hint="10 digits. Used for Call and WhatsApp links."
            error={state.fieldErrors?.contactPhone}
          />
          <TextField
            label="Email address"
            name="contactEmail"
            type="email"
            inputMode="email"
            defaultValue={settings?.contact_email ?? BUSINESS.email}
            required
            placeholder="hello@example.co.za"
            error={state.fieldErrors?.contactEmail}
          />
        </div>

        <div className="mt-5">
          <TextField
            label="Instagram link"
            name="instagramUrl"
            type="url"
            inputMode="url"
            defaultValue={settings?.instagram_url ?? BUSINESS.instagram.url}
            placeholder="https://instagram.com/griponza"
            hint="Full link, or leave blank to hide the Instagram links."
            error={state.fieldErrors?.instagramUrl}
          />
        </div>

        <div className="mt-5">
          <TextField
            label="Internal WhatsApp number"
            name="whatsappNumber"
            type="tel"
            inputMode="tel"
            defaultValue={admin?.whatsapp_number ?? ""}
            placeholder="+27000000000"
            hint="Admin only. Use the public phone field above for storefront links."
            error={state.fieldErrors?.whatsappNumber}
          />
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-line bg-ink-soft p-4 sm:p-5">
        <h2 className="eyebrow text-bone">Business details</h2>
        <p className="mt-1 text-xs leading-relaxed text-bone-dim">
          Shown on legal and contact pages when filled in. Leave blank if you do not have them yet.
        </p>

        <div className="mt-5 grid gap-5">
          <TextAreaField
            label="Business address"
            name="businessAddress"
            defaultValue={settings?.business_address ?? ""}
            rows={2}
            maxLength={300}
            placeholder="Street, suburb, city, postal code"
            hint="Do not add a home address unless you are happy for it to appear publicly."
            error={state.fieldErrors?.businessAddress}
          />
          <TextField
            label="Company registration number"
            name="businessRegistration"
            defaultValue={settings?.business_registration ?? ""}
            maxLength={120}
            placeholder="2026/000000/07"
            hint="Shown on legal pages. Leave blank if the business is not registered yet."
            error={state.fieldErrors?.businessRegistration}
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
                Visitors see: &ldquo;{MAINTENANCE_MESSAGE}&rdquo;
              </span>
            </span>
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button type="submit" disabled={pending} className={buttonClasses("primary")}>
          {pending ? "Saving…" : "Save settings"}
        </button>
        {dirty ? <p className="text-xs text-accent">Unsaved changes</p> : null}
      </div>
    </form>
  );
}
