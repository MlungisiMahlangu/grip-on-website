import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/ui";
import { CollectionForm } from "@/components/admin/collection-form";

export const metadata: Metadata = { title: "New collection" };

export default function NewCollectionPage() {
  return (
    <>
      <Link
        href="/admin/collections"
        className="mb-5 inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:text-bone"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All collections
      </Link>

      <AdminPageHeader
        eyebrow="Merchandising"
        title="New collection."
        description="Name it, give it a slug, and assign products from the product editor."
      />

      <CollectionForm />
    </>
  );
}
