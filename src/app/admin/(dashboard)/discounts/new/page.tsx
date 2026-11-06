import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FEATURES } from "@/lib/features";
import { AdminPageHeader } from "@/components/admin/ui";
import { DiscountForm } from "@/components/admin/discount-form";

export const metadata: Metadata = { title: "New discount" };

export default function NewDiscountPage() {
  if (!FEATURES.discounts) redirect("/admin/discounts");

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
        title="New discount."
        description="Codes are checked again at checkout, so expired or paused codes can never be forced through."
      />

      <DiscountForm />
    </>
  );
}
