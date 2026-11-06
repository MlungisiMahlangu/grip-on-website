"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Banknote,
  Loader2,
  PencilLine,
  RotateCcw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { checkoutSchema, PROVINCES, type CheckoutInput } from "@/lib/checkout/schema";
import type { CheckoutVariant } from "@/lib/checkout/types";
import { placeOrder } from "@/lib/checkout/actions";
import { PAYMENT_METHODS } from "@/lib/payments";
import { formatPriceCents } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { buttonClasses } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { LifterMark } from "@/components/brand/lifter-mark";

const FIELD_ORDER: (keyof CheckoutInput)[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "addressLine1",
  "addressLine2",
  "suburb",
  "city",
  "province",
  "postalCode",
  "deliveryArea",
  "deliveryNotes",
  "termsAccepted",
];

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = (Math.random() * 16) | 0;
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function CheckoutView({ variants }: { variants: CheckoutVariant[] }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const openCart = useUIStore((state) => state.openCart);
  const [serverError, setServerError] = useState<string | null>(null);
  const [subscribe, setSubscribe] = useState(false);
  const [review, setReview] = useState<{ values: CheckoutInput; key: string } | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const variantMap = useMemo(
    () => new Map(variants.map((variant) => [variant.variantId, variant])),
    [variants],
  );

  const lines = useMemo(
    () =>
      items.map((item) => ({
        item,
        live: variantMap.get(item.variantId) ?? null,
      })),
    [items, variantMap],
  );

  const unavailable = lines.filter(({ live }) => !live || !live.available);
  const subtotalCents = lines.reduce(
    (total, { item, live }) => total + (live?.priceCents ?? item.priceCents) * item.quantity,
    0,
  );
  const totalCents = subtotalCents;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "cod", deliveryArea: "johannesburg" },
    mode: "onBlur",
  });

  const deliveryArea = useWatch({
    control,
    name: "deliveryArea",
    defaultValue: "johannesburg",
  });
  const freeDelivery = deliveryArea === "johannesburg";

  const focusFirstError = (formErrors: FieldErrors<CheckoutInput>) => {
    const first = FIELD_ORDER.find((field) => formErrors[field]);
    if (!first) return;

    const element = document.getElementById(first);
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => element.focus({ preventScroll: true }), 150);
  };

  const onReview = handleSubmit((values) => {
    setServerError(null);

    if (items.length === 0) {
      setServerError("Your bag is empty. Add a piece before checking out.");
      return;
    }

    if (unavailable.length > 0) {
      setServerError(
        "One or more pieces are no longer available. Remove them from your bag and try again.",
      );
      return;
    }

    setReviewError(null);
    setReview({ values, key: createIdempotencyKey() });
  }, focusFirstError);

  const confirmOrder = async () => {
    if (!review || submitting) return;

    setSubmitting(true);
    setReviewError(null);

    const result = await placeOrder({
      customer: review.values,
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      subscribe,
      idempotencyKey: review.key,
    });

    if (!result.ok) {
      setSubmitting(false);
      setReviewError(result.message);
      return;
    }

    clear();
    router.push(`/order/${result.orderNumber}`);
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40svh] items-center justify-center">
        <LifterMark className="animate-mark h-10 opacity-40" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-ink-soft px-6 py-16 text-center">
        <LifterMark className="mx-auto h-12 opacity-50" />
        <h2 className="display mt-6 text-h2">Your bag is empty.</h2>
        <p className="mx-auto mt-3 max-w-sm text-body leading-relaxed text-bone-dim">
          Add a piece before checking out. We deliver across South Africa with cash on delivery.
        </p>
        <Link href="/shop" className={buttonClasses("primary", "mt-7")}>
          Shop the range <ArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={onReview} noValidate className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-10 lg:col-span-7">
          {serverError ? (
            <p
              role="alert"
              className="rounded-[var(--radius-card)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200"
            >
              {serverError}
            </p>
          ) : null}

          <section aria-labelledby="checkout-contact">
            <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
              <h2 id="checkout-contact" className="eyebrow text-bone">
                01 · Contact
              </h2>
              <span className="text-xs text-bone-dim">We use this to confirm your order.</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField
                label="First name"
                autoComplete="given-name"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <TextField
                label="Last name"
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
              <TextField
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <TextField
                label="Mobile number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Start with 0 or +27"
                error={errors.phone?.message}
                {...register("phone")}
              />
            </div>
            <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border border-line px-3 py-2.5 has-[:checked]:border-accent/50 has-[:checked]:bg-accent/5">
              <input
                type="checkbox"
                name="subscribe"
                checked={subscribe}
                onChange={(event) => setSubscribe(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[var(--accent)]"
              />
              <span>
                <span className="block text-sm text-bone">Email me when new gear lands</span>
                <span className="mt-0.5 block text-xs text-bone-dim">
                  Occasional updates only. Unsubscribe any time.
                </span>
              </span>
            </label>
          </section>

          <section aria-labelledby="checkout-address">
            <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
              <h2 id="checkout-address" className="eyebrow text-bone">
                02 · Delivery address
              </h2>
              <span className="text-xs text-bone-dim">Free in Johannesburg.</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField
                label="Street address"
                autoComplete="address-line1"
                fieldClassName="sm:col-span-2"
                error={errors.addressLine1?.message}
                {...register("addressLine1")}
              />
              <TextField
                label="Apartment, unit (optional)"
                autoComplete="address-line2"
                fieldClassName="sm:col-span-2"
                error={errors.addressLine2?.message}
                {...register("addressLine2")}
              />
              <TextField
                label="Suburb"
                autoComplete="address-level3"
                error={errors.suburb?.message}
                {...register("suburb")}
              />
              <TextField
                label="City or town"
                autoComplete="address-level2"
                error={errors.city?.message}
                {...register("city")}
              />
              <SelectField
                label="Province"
                autoComplete="address-level1"
                defaultValue=""
                error={errors.province?.message}
                {...register("province")}
              >
                <option value="" disabled>
                  Select province
                </option>
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </SelectField>
              <TextField
                label="Postal code"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={4}
                error={errors.postalCode?.message}
                {...register("postalCode")}
              />
              <TextAreaField
                label="Delivery notes (optional)"
                fieldClassName="sm:col-span-2"
                hint="Gate code, landmark, or the best time to deliver."
                error={errors.deliveryNotes?.message}
                {...register("deliveryNotes")}
              />
            </div>

            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-bone">Delivery area</legend>
              <p className="mt-1 text-caption leading-relaxed text-bone-dim">
                Delivery is free in Johannesburg. Outside Johannesburg, we contact you to confirm
                the courier cost and options before dispatch.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border border-line bg-ink-soft p-4 transition-colors has-[:checked]:border-accent/60 has-[:checked]:bg-accent/5">
                  <input
                    type="radio"
                    value="johannesburg"
                    className="sr-only"
                    {...register("deliveryArea")}
                  />
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.7} />
                  <span>
                    <span className="block text-sm font-semibold text-bone">Johannesburg</span>
                    <span className="mt-1 block text-caption leading-relaxed text-bone-dim">
                      Free delivery
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border border-line bg-ink-soft p-4 transition-colors has-[:checked]:border-accent/60 has-[:checked]:bg-accent/5">
                  <input
                    type="radio"
                    value="outside"
                    className="sr-only"
                    {...register("deliveryArea")}
                  />
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.7} />
                  <span>
                    <span className="block text-sm font-semibold text-bone">
                      Outside Johannesburg
                    </span>
                    <span className="mt-1 block text-caption leading-relaxed text-bone-dim">
                      Courier cost confirmed with you
                    </span>
                  </span>
                </label>
              </div>
              {errors.deliveryArea?.message ? (
                <p role="alert" className="mt-2 text-caption text-red-300">
                  {errors.deliveryArea.message}
                </p>
              ) : null}
            </fieldset>
          </section>

          <section aria-labelledby="checkout-payment">
            <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
              <h2 id="checkout-payment" className="eyebrow text-bone">
                03 · Payment
              </h2>
              <span className="text-xs text-bone-dim">One method, no surprises.</span>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border border-accent/60 bg-ink-soft p-4"
                >
                  <input
                    type="radio"
                    value={method.id}
                    className="sr-only"
                    {...register("paymentMethod")}
                  />
                  <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.7} />
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-bone">{method.label}</span>
                      <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-accent-ink">
                        Selected
                      </span>
                    </span>
                    <span className="mt-1 block text-caption leading-relaxed text-bone-dim">
                      {method.summary} {method.detail}
                    </span>
                  </span>
                </label>
              ))}
              <p className="text-caption leading-relaxed text-bone-dim">
                Card and instant EFT are not available yet. Cash on delivery is the only payment
                method for now.
              </p>
            </div>
          </section>
        </div>

        <aside aria-labelledby="checkout-summary" className="lg:col-span-5">
          <div className="rounded-[var(--radius-card)] border border-line bg-ink-soft lg:sticky lg:top-28">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 id="checkout-summary" className="eyebrow text-bone">
                Order summary
              </h2>
              <button
                type="button"
                onClick={openCart}
                className="min-h-11 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim transition-colors hover:text-accent"
              >
                Edit bag
              </button>
            </div>

            <ul className="divide-y divide-line px-5">
              {lines.map(({ item, live }) => {
                const lineTotal = (live?.priceCents ?? item.priceCents) * item.quantity;
                const outOfStock = !live || !live.available;

                return (
                  <li key={item.key} className="flex gap-4 py-4">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised">
                      {item.imageUrl ? (
                        <Image
                          src={live?.imageUrl ?? item.imageUrl}
                          alt=""
                          aria-hidden="true"
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center">
                          <LifterMark className="h-7 opacity-30" />
                        </span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold uppercase tracking-[0.04em] text-bone">
                          {live?.productName ?? item.productName}
                        </p>
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-bone-dim">
                          {item.colourName} · {item.size === "ONE_SIZE" ? "One size" : item.size} ·
                          Qty {item.quantity}
                        </p>
                        {outOfStock ? (
                          <p className="mt-1.5 text-xs text-red-300">No longer available.</p>
                        ) : null}
                      </div>
                      <p className="shrink-0 font-mono text-xs text-bone">
                        {formatPriceCents(lineTotal)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-line px-5 py-4">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-bone-dim">Subtotal</span>
                <span className="font-mono text-bone">{formatPriceCents(subtotalCents)}</span>
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-3 text-sm">
                <span className="text-bone-dim">Delivery</span>
                <span className="font-mono text-bone">
                  {freeDelivery ? "Free" : "To be confirmed"}
                </span>
              </div>
              {freeDelivery ? null : (
                <p className="mt-2 text-caption leading-relaxed text-bone-dim">
                  We will contact you to confirm the courier cost and options before dispatch. The
                  total shown does not include delivery.
                </p>
              )}
              <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-4">
                <span className="text-sm text-bone">Total</span>
                <span className="font-mono text-lg text-bone">{formatPriceCents(totalCents)}</span>
              </div>
            </div>

            <div className="border-t border-line px-5 py-4">
              {unavailable.length > 0 ? (
                <p className="mb-3 text-caption leading-relaxed text-red-300">
                  Remove the unavailable items before placing your order.
                </p>
              ) : null}
              <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border border-line px-3 py-2.5 transition-colors has-[:checked]:border-accent/50 has-[:checked]:bg-accent/5 has-[:focus-visible]:border-accent">
                <input
                  id="termsAccepted"
                  type="checkbox"
                  aria-invalid={Boolean(errors.termsAccepted)}
                  aria-describedby={errors.termsAccepted ? "termsAccepted-error" : undefined}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
                  {...register("termsAccepted")}
                />
                <span className="text-[11px] leading-relaxed text-bone-dim">
                  <span className="block">I have read and agree to:</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-3">
                    <Link
                      href="/terms-of-sale"
                      className="inline-flex min-h-11 items-center text-bone underline underline-offset-2 hover:text-accent"
                    >
                      Terms of Sale
                    </Link>
                    <Link
                      href="/privacy"
                      className="inline-flex min-h-11 items-center text-bone underline underline-offset-2 hover:text-accent"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      href="/shipping-returns"
                      className="inline-flex min-h-11 items-center text-bone underline underline-offset-2 hover:text-accent"
                    >
                      Shipping &amp; Returns Policy
                    </Link>
                  </span>
                </span>
              </label>
              {errors.termsAccepted?.message ? (
                <p id="termsAccepted-error" role="alert" className="mt-2 text-xs text-red-400">
                  {errors.termsAccepted.message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={unavailable.length > 0}
                className={buttonClasses("primary", "mt-4 w-full")}
              >
                Review order · {formatPriceCents(totalCents)}
                <ArrowRight />
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-bone-dim">
                <Banknote className="h-3 w-3 text-accent" strokeWidth={1.7} />
                Pay {formatPriceCents(totalCents)} in cash on delivery
              </p>
              {freeDelivery ? null : (
                <p className="mt-2 text-center text-[11px] leading-relaxed text-bone-dim">
                  Courier cost is confirmed with you before dispatch and paid with your order.
                </p>
              )}
            </div>

            <ul className="grid gap-2 border-t border-line px-5 py-4 text-xs text-bone-dim">
              <li className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-accent" strokeWidth={1.7} />
                Free delivery in Johannesburg. Other areas quoted first.
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="h-3.5 w-3.5 text-accent" strokeWidth={1.7} />
                14-day returns on unworn pieces.
              </li>
              <li className="flex items-center gap-2">
                <ShoppingBag className="h-3.5 w-3.5 text-accent" strokeWidth={1.7} />
                Checked and packed by hand.
              </li>
            </ul>
          </div>
        </aside>
      </form>

      <Modal
        open={review !== null}
        onClose={() => {
          if (!submitting) setReview(null);
        }}
        title="Review and confirm your order"
        description="Check your details below. You pay cash when your order arrives."
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setReview(null)}
              disabled={submitting}
              className={buttonClasses("secondary")}
            >
              <PencilLine />
              Edit details
            </button>
            <button
              type="button"
              onClick={confirmOrder}
              disabled={submitting}
              className={buttonClasses("primary")}
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Placing order
                </>
              ) : (
                <>Place order · {formatPriceCents(totalCents)}</>
              )}
            </button>
          </div>
        }
      >
        {review ? (
          <div className="space-y-5">
            {reviewError ? (
              <p
                role="alert"
                className="rounded-[var(--radius-card)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200"
              >
                {reviewError}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="eyebrow text-bone-dim">Contact</p>
                <p className="mt-1.5 text-sm text-bone">
                  {review.values.firstName} {review.values.lastName}
                </p>
                <p className="mt-1 break-all text-xs text-bone-dim">{review.values.email}</p>
                <p className="text-xs text-bone-dim">{review.values.phone}</p>
              </div>
              <div>
                <p className="eyebrow text-bone-dim">Deliver to</p>
                <p className="mt-1.5 text-sm leading-relaxed text-bone">
                  {review.values.addressLine1}
                  {review.values.addressLine2 ? `, ${review.values.addressLine2}` : ""}
                  <br />
                  {review.values.suburb}, {review.values.city}
                  <br />
                  {review.values.province}, {review.values.postalCode}
                </p>
              </div>
            </div>

            <div>
              <p className="eyebrow text-bone-dim">Delivery</p>
              <p className="mt-1.5 text-sm leading-relaxed text-bone">
                {review.values.deliveryArea === "johannesburg"
                  ? "Free delivery in Johannesburg."
                  : "Outside Johannesburg. We will contact you to confirm the courier cost before dispatch."}
              </p>
              {review.values.deliveryNotes ? (
                <p className="mt-1 text-xs leading-relaxed text-bone-dim">
                  Notes: {review.values.deliveryNotes}
                </p>
              ) : null}
            </div>

            <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
              {lines.map(({ item, live }) => (
                <li key={item.key} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-bone">
                      {live?.productName ?? item.productName}
                    </p>
                    <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                      {item.colourName} · {item.size === "ONE_SIZE" ? "One size" : item.size} · Qty{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-xs text-bone">
                    {formatPriceCents((live?.priceCents ?? item.priceCents) * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-bone-dim">Subtotal</span>
                <span className="font-mono text-bone">{formatPriceCents(subtotalCents)}</span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-bone-dim">Delivery</span>
                <span className="font-mono text-bone">
                  {review.values.deliveryArea === "johannesburg" ? "Free" : "To be confirmed"}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-line pt-2">
                <span className="text-bone">Total</span>
                <span className="font-mono text-base text-bone">
                  {formatPriceCents(totalCents)}
                </span>
              </div>
              <p className="pt-1 text-xs leading-relaxed text-bone-dim">
                Pay {formatPriceCents(totalCents)} in cash on delivery.
                {review.values.deliveryArea === "johannesburg"
                  ? ""
                  : " Delivery is added after we confirm the courier cost with you."}
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
