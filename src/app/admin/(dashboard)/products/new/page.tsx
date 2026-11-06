import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminCollections } from "@/lib/admin/queries";
import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const collections = await getAdminCollections();

  return (
    <>
      <Link
        href="/admin/products"
        className="mb-5 inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:text-bone"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All products
      </Link>

      <AdminPageHeader
        eyebrow="Catalogue"
        title="New product."
        description="Create the product shell first. Colourways, images and stock are added on the next screen."
      />

      <ProductForm collections={collections} selectedCollectionIds={[]} />
    </>
  );
}
