import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Package, Trash2 } from "lucide-react";
import { getAdminCollection } from "@/lib/admin/queries";
import { deleteCollectionAction } from "@/lib/admin/collection-actions";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/ui/confirm-dialog";
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

      <div className="mt-8 rounded-[var(--radius-card)] border border-red-400/25 bg-red-400/[0.04] p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-red-300">
          Delete collection
        </p>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-bone-dim">
          Removes the collection and its product links. The products themselves stay in the
          store. This cannot be undone.
        </p>
        <form action={deleteCollectionAction} className="mt-4">
          <input type="hidden" name="id" value={collection.id} />
          <ConfirmSubmit
            title={`Delete ${collection.name}?`}
            description="The collection and its product links will be removed. Products stay in the store. This cannot be undone."
            confirmLabel="Delete collection"
            className={buttonClasses("secondary", "border-red-400/40 text-red-300")}
          >
            <Trash2 aria-hidden="true" />
            Delete collection
          </ConfirmSubmit>
        </form>
      </div>
    </>
  );
}
