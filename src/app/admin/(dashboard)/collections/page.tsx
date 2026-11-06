import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Archive, ArchiveRestore, Pencil, Plus } from "lucide-react";
import { getAdminCollections } from "@/lib/admin/queries";
import { toggleCollectionActiveAction } from "@/lib/admin/collection-actions";
import { buttonClasses } from "@/components/ui/button";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/ui";
import { LifterMark } from "@/components/brand/lifter-mark";
import { FlashToast } from "@/components/admin/flash-toast";

export const metadata: Metadata = { title: "Collections" };

export default async function AdminCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [params, collections] = await Promise.all([searchParams, getAdminCollections()]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Merchandising"
        title="Collections."
        description="Group products into the collections customers browse. Archived collections stay out of the storefront."
        action={
          <Link href="/admin/collections/new" className={buttonClasses("primary")}>
            <Plus aria-hidden="true" />
            New collection
          </Link>
        }
      />

      {params.saved === "1" ? <FlashToast message="Collection saved." /> : null}
      {params.deleted === "1" ? <FlashToast message="Collection deleted." /> : null}

      {collections.length === 0 ? (
        <AdminPanel title="Collections">
          <AdminEmpty
            title="No collections yet."
            body="Create a collection, then assign products from the product editor."
            action={
              <Link href="/admin/collections/new" className={buttonClasses("primary")}>
                New collection
              </Link>
            }
          />
        </AdminPanel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => (
            <article
              key={collection.id}
              className="flex flex-col rounded-[var(--radius-card)] border border-line bg-ink-soft"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-t-[var(--radius-card)] border-b border-line bg-ink-raised">
                {collection.image ? (
                  <Image
                    src={collection.image}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center">
                    <LifterMark className="h-10 opacity-25" />
                  </span>
                )}
                {!collection.is_active ? (
                  <span className="absolute left-3 top-3 rounded-full border border-line bg-ink/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim backdrop-blur">
                    Archived
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-medium text-bone">{collection.name}</h2>
                    <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                      {collection.slug}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                    {collection.productCount} {collection.productCount === 1 ? "product" : "products"}
                  </span>
                </div>

                {collection.description ? (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-bone-dim">
                    {collection.description}
                  </p>
                ) : null}

                <div className="mt-auto flex items-center gap-1.5 pt-4">
                  <Link
                    href={`/admin/collections/${collection.id}`}
                    className={buttonClasses("secondary", "min-h-11 flex-1")}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </Link>
                  <form action={toggleCollectionActiveAction}>
                    <input type="hidden" name="id" value={collection.id} />
                    <input type="hidden" name="value" value={String(!collection.is_active)} />
                    <button
                      type="submit"
                      className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] border border-line text-bone-dim transition-colors hover:border-bone hover:text-bone"
                      aria-label={
                        collection.is_active ? "Archive collection" : "Restore collection"
                      }
                      title={collection.is_active ? "Archive collection" : "Restore collection"}
                    >
                      {collection.is_active ? (
                        <Archive className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
