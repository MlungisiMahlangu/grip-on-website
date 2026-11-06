import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { TrackOrderForm } from "@/components/orders/track-order-form";

export const metadata: Metadata = {
  title: "Track order",
  description:
    "Follow your Grip On order from packing to delivery using your order number and checkout contact.",
  alternates: { canonical: "/track-order" },
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string | string[] }>;
}) {
  const params = await searchParams;
  const order = Array.isArray(params.order) ? params.order[0] : params.order;

  return (
    <div className="bg-ink">
      <section className="border-b border-line">
        <div className="container-x pb-8 pt-8 sm:pt-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Track order" },
            ]}
          />

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow text-accent">Where is it?</p>
              <h1 className="display mt-3 text-[clamp(3.5rem,10vw,8rem)]">
                Track it<span className="text-accent">.</span>
              </h1>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-bone-dim">
              Enter your order number and the email or phone number you used at checkout. No account
              needed.
            </p>
          </div>
        </div>
      </section>

      <div className="container-x py-8 sm:py-10">
        <TrackOrderForm defaultOrder={order} />
      </div>
    </div>
  );
}
