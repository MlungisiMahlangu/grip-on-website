import type { Metadata } from "next";
import { getCatalogue } from "@/lib/catalogue/queries";
import { deliveryPricing, getStoreSettings } from "@/lib/orders/settings";
import type { CheckoutVariant } from "@/lib/checkout/types";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Confirm your delivery details and place a cash-on-delivery order with Grip On.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [{ products }, settings] = await Promise.all([getCatalogue(), getStoreSettings()]);
  const { feeCents, thresholdCents } = deliveryPricing(settings);

  const variants: CheckoutVariant[] = products.flatMap((product) =>
    product.colours.flatMap((colour) =>
      colour.sizes.map((size) => ({
        variantId: size.variantId,
        productName: product.name,
        productSlug: product.slug,
        colourName: colour.name,
        size: size.size,
        priceCents: product.priceCents,
        stock: size.stock,
        imageUrl: colour.frontImage,
      })),
    ),
  );

  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-8 pt-8 sm:pt-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              { label: "Checkout" },
            ]}
          />

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow text-accent">Almost yours</p>
              <h1 className="display mt-3 text-[clamp(3.5rem,10vw,8rem)]">
                Checkout<span className="text-accent">.</span>
              </h1>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-bone-dim">
              Cash on delivery. Add your delivery details and we will confirm your order by email.
            </p>
          </div>
        </div>
      </section>

      <div className="container-x py-8 sm:py-10">
        <CheckoutView
          variants={variants}
          deliveryFeeCents={feeCents}
          freeDeliveryThresholdCents={thresholdCents}
        />
      </div>
    </div>
  );
}
