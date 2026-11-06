"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Banknote,
  Loader2,
  RotateCcw,
  ShoppingBag,
  Tag,
  Truck,
  X,
} from "lucide-react";
import { checkoutSchema, PROVINCES, type CheckoutInput } from "@/lib/checkout/schema";
import type { CheckoutVariant } from "@/lib/checkout/types";
import {
  applyDiscountAction,
  placeOrder,
  type AppliedDiscount,
} from "@/lib/checkout/actions";
import { PAYMENT_METHODS } from "@/lib/payments";
import { formatPriceCents } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { buttonClasses } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/form-field";
import { LifterMark } from "@/components/brand/lifter-mark";

export function CheckoutView({
  variants,
  deliveryFeeCents,
  freeDeliveryThresholdCents,
}: {
  variants: CheckoutVariant[];
  deliveryFeeCents: number;
  freeDeliveryThresholdCents: number;
}) {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const openCart = useUIStore((state) => state.openCart);
  const [serverError, setServerError] = useState<string | null>(null);
  const [discount, setDiscount] = useState<AppliedDiscount | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [applyingCode, setApplyingCode] = useState(false);
  const [subscribe, setSubscribe] = useState(false);

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

  const unavailable = lines.filter(
    ({ item, live }) => !live || live.stock < item.quantity,
  );
  const subtotalCents = lines.reduce(
    (total, { item, live }) => total + (live?.priceCents ?? item.priceCents) * item.quantity,
    0,
  );
  const discountMeetsMinimum = discount
    ? subtotalCents >= discount.minSubtotalCents
    : false;
  const discountCents =
    discount && discountMeetsMinimum
      ? Math.min(
          discount.kind === "percent"
            ? Math.floor((subtotalCents * discount.value) / 100)
            : discount.value,
          subtotalCents,
        )
      : 0;
  const discountedSubtotalCents = subtotalCents - discountCents;
  const deliveryCents =
    discountedSubtotalCents >= freeDeliveryThresholdCents ? 0 : deliveryFeeCents;
  const totalCents = discountedSubtotalCents + deliveryCents;
  const remainingForFreeDelivery = Math.max(
    0,
    freeDeliveryThresholdCents - discountedSubtotalCents,
  );

  async function applyDiscount() {
    setDiscountError(null);
    if (!codeInput.trim()) {
      setDiscountError("Enter a code first.");
      return;
    }

    setApplyingCode(true);
    const result = await applyDiscountAction(codeInput, subtotalCents);
    setApplyingCode(false);

    if (!result.ok) {
      setDiscount(null);
      setDiscountError(result.message);
      return;
    }

    setDiscount(result.discount);
    setCodeInput("");
  }

  function removeDiscount() {
    setDiscount(null);
    setDiscountError(null);
    setCodeInput("");
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "cod" },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    if (items.length === 0) {
      setServerError("Your bag is empty. Add a piece before checking out.");
      return;
    }

    if (unavailable.length > 0) {
      setServerError(
        "One or more pieces are no longer available in that quantity. Update your bag and try again.",
      );
      return;
    }

    if (discount && !discountMeetsMinimum) {
      setServerError(
        `Your bag is below the minimum spend for ${discount.code}. Remove the code or add another piece.`,
      );
      return;
    }

    const result = await placeOrder({
      customer: values,
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      discountCode: discount && discountMeetsMinimum ? discount.code : undefined,
      subscribe,
    });

    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    clear();
    router.push(`/order/${result.orderNumber}`);
  });

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
        <h2 className="display mt-6 text-4xl">Your bag is empty.</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-bone-dim">
          Add a piece before checking out. We deliver across South Africa with cash on delivery.
        </p>
        <Link href="/shop" className={buttonClasses("primary", "mt-7")}>
          Shop the range <ArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-12 lg:gap-12">
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
            <span className="text-xs text-bone-dim">Nationwide courier.</span>
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
                  <span className="mt-1 block text-xs leading-relaxed text-bone-dim">
                    {method.summary} {method.detail}
                  </span>
                </span>
              </label>
            ))}
            <p className="text-xs leading-relaxed text-bone-dim">
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
              const outOfStock = !live || live.stock < item.quantity;

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
                        {item.colourName} · {item.size === "ONE_SIZE" ? "One size" : item.size} · Qty{" "}
                        {item.quantity}
                      </p>
                      {outOfStock ? (
                        <p className="mt-1.5 text-xs text-red-300">
                          {live ? "Not enough stock left." : "No longer available."}
                        </p>
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

            <div className="mt-3 border-t border-line pt-3">
              {discount ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-sm text-bone">
                    <Tag className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={1.7} />
                    <span className="truncate font-mono text-xs">{discount.code}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    {discountMeetsMinimum ? (
                      <span className="font-mono text-sm text-emerald-300">
                        −{formatPriceCents(discountCents)}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={removeDiscount}
                      className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] text-bone-dim transition-colors hover:text-bone"
                      aria-label={`Remove discount code ${discount.code}`}
                      title="Remove code"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label htmlFor="discount-code" className="sr-only">
                    Discount code
                  </label>
                  <input
                    id="discount-code"
                    name="discount-code"
                    type="text"
                    autoComplete="off"
                    value={codeInput}
                    onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void applyDiscount();
                      }
                    }}
                    placeholder="Discount code"
                    maxLength={30}
                    className="min-h-11 min-w-0 flex-1 rounded-[var(--radius-card)] border border-line bg-ink px-3 font-mono text-xs uppercase tracking-[0.08em] text-bone transition-colors placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-bone-dim/80 hover:border-line-strong focus:border-accent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void applyDiscount()}
                    disabled={applyingCode}
                    className={buttonClasses("secondary", "shrink-0")}
                  >
                    {applyingCode ? "Checking…" : "Apply"}
                  </button>
                </div>
              )}

              {discount && !discountMeetsMinimum ? (
                <p className="mt-2 text-xs leading-relaxed text-amber-300">
                  Add {formatPriceCents(discount.minSubtotalCents - subtotalCents)} more to use{" "}
                  {discount.code}.
                </p>
              ) : null}

              {discountError ? (
                <p role="alert" className="mt-2 text-xs leading-relaxed text-red-300">
                  {discountError}
                </p>
              ) : null}
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-3 text-sm">
              <span className="text-bone-dim">Delivery</span>
              <span className="font-mono text-bone">
                {deliveryCents === 0 ? "Free" : formatPriceCents(deliveryCents)}
              </span>
            </div>
            {remainingForFreeDelivery > 0 ? (
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                Add {formatPriceCents(remainingForFreeDelivery)} for free delivery
              </p>
            ) : null}
            <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-4">
              <span className="text-sm text-bone">Total</span>
              <span className="font-mono text-lg text-bone">{formatPriceCents(totalCents)}</span>
            </div>
          </div>

          <div className="border-t border-line px-5 py-4">
            {unavailable.length > 0 ? (
              <p className="mb-3 text-xs leading-relaxed text-red-300">
                Remove the unavailable items before placing your order.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting || unavailable.length > 0}
              className={buttonClasses("primary", "w-full")}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Placing order
                </>
              ) : (
                <>Place order · {formatPriceCents(totalCents)}</>
              )}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-bone-dim">
              <Banknote className="h-3 w-3 text-accent" strokeWidth={1.7} />
              Pay {formatPriceCents(totalCents)} in cash on delivery
            </p>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-bone-dim">
              By placing your order you agree to our{" "}
              <Link href="/terms" className="text-bone underline underline-offset-2 hover:text-accent">
                terms of sale
              </Link>
              ,{" "}
              <Link
                href="/privacy"
                className="text-bone underline underline-offset-2 hover:text-accent"
              >
                privacy policy
              </Link>{" "}
              and{" "}
              <Link
                href="/shipping-returns"
                className="text-bone underline underline-offset-2 hover:text-accent"
              >
                shipping &amp; returns policy
              </Link>
              .
            </p>
          </div>

          <ul className="grid gap-2 border-t border-line px-5 py-4 text-xs text-bone-dim">
            <li className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-accent" strokeWidth={1.7} />
              Delivered nationwide in 2–5 working days.
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
  );
}
