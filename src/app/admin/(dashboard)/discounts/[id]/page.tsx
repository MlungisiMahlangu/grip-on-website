import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminDiscount } from "@/lib/admin/operations-queries";
import { formatOrderDate } from "@/lib/orders/format";
import { AdminPageHeader, AdminPanel } from "@/components/admin/ui";
import { DiscountForm } from "@/components/admin/discount-form";
import { DiscountStatusBadge } from "@/components/admin/discount-status";

export const metadata: Metadata = { title: "Edit discount" };

export default async function EditDiscountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const discount = await getAdminDiscount(id);
  if (!discount) notFound();

  return (
    <>
      <Link
        href="/admin/discounts"
        className="mb-5 inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:text-bone"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All discounts
      </Link>

      <AdminPageHeader
        eyebrow="Marketing"
        title={`${discount.code}.`}
        description={`Created ${formatOrderDate(discount.created_at, true)} · redeemed ${discount.times_redeemed} ${discount.times_redeemed === 1 ? "time" : "times"}.`}
        action={<DiscountStatusBadge discount={discount} />}
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <DiscountForm discount={discount} />
        </div>

        <div className="xl:col-span-4">
          <AdminPanel title="How it applies">
            <dl className="space-y-3 px-4 py-5 text-sm sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-bone-dim">Discount</dt>
                <dd className="text-right text-bone">
                  {discount.kind === "percent"
                    ? `${discount.value}% off the bag subtotal`
                    : `R${(discount.value / 100).toFixed(2)} off the bag subtotal`}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-bone-dim">Minimum spend</dt>
                <dd className="text-right text-bone">
                  {discount.min_subtotal_cents > 0
                    ? `R${(discount.min_subtotal_cents / 100).toFixed(2)}`
                    : "None"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-bone-dim">Window</dt>
                <dd className="text-right text-bone">
                  {discount.starts_at ? formatOrderDate(discount.starts_at, true) : "From creation"}
                  {" – "}
                  {discount.ends_at ? formatOrderDate(discount.ends_at, true) : "No end"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 border-t border-line pt-3">
                <dt className="text-bone-dim">Redemptions</dt>
                <dd className="text-right text-bone">
                  {discount.times_redeemed}
                  {discount.max_redemptions === null
                    ? " · unlimited"
                    : ` of ${discount.max_redemptions}`}
                </dd>
              </div>
            </dl>
            <p className="border-t border-line px-4 py-3 text-[11px] leading-relaxed text-bone-dim sm:px-5">
              Delivery is free once the discounted subtotal reaches the store threshold. Pausing a
              code blocks it immediately at checkout.
            </p>
          </AdminPanel>
        </div>
      </div>
    </>
  );
}
