import type { Metadata } from "next";
import { getAdminSettingsBundle } from "@/lib/admin/operations-queries";
import { AdminPageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const bundle = await getAdminSettingsBundle();

  return (
    <>
      <AdminPageHeader
        eyebrow="Configure"
        title="Settings."
        description="The storefront reads these values directly. Change them here instead of in code."
      />

      <div className="max-w-3xl">
        <SettingsForm settings={bundle.settings} admin={bundle.admin} />
      </div>
    </>
  );
}
