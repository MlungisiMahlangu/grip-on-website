import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Grip On Admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();

  return (
    <AdminShell email={session.email} name={session.profile.full_name ?? ""}>
      {children}
    </AdminShell>
  );
}
