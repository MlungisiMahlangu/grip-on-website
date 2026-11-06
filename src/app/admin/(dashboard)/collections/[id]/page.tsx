import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Package } from "lucide-react";
import { getAdminCollection } from "@/lib/admin/queries";
import { buttonClasses } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/ui";
import { CollectionForm } from "@/components/admin/collection-form";

export const metadata: Metadata = { title: "Edit collection" };

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAdminCollection(id);
  if (!data) notFound();

  const { collection, productCount } = data;

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
        eyebrow={collection.is_active ? "Live collection" : "Archived collection"}
        title={`${collection.name}.`}
        description={`${productCount} ${productCount === 1 ? "product" : "products"} assigned · ${collection.slug}`}
        action={
          <>
            <Link
              href={`/collections/${collection.slug}`}
              target="_blank"
              className={buttonClasses("secondary")}
            >
              View store
              <ExternalLink aria-hidden="true" />
            </Link>
            <Link href="/admin/products" className={buttonClasses("secondary")}>
              <Package aria-hidden="true" />
              Products
            </Link>
          </>
        }
      />

      <CollectionForm collection={collection} />

      <p className="mt-6 text-xs leading-relaxed text-bone-dim">
        Assign products to this collection from each product&apos;s editor. Archiving a collection
        hides it from the storefront without removing its products.
      </p>
    </>
  );
}
