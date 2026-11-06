import type { Metadata } from "next";
import Link from "next/link";
import { Search, ShieldCheck, UserRound } from "lucide-react";
import { getAdminUsers } from "@/lib/admin/operations-queries";
import { setUserRoleAction } from "@/lib/admin/user-actions";
import { getAdminSession } from "@/lib/admin/auth";
import { formatOrderDate } from "@/lib/orders/format";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { controlClasses } from "@/components/ui/form-field";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  TableShell,
  Td,
  Th,
} from "@/components/admin/ui";
import { InviteAdminForm } from "@/components/admin/invite-admin-form";
import { FlashToast } from "@/components/admin/flash-toast";
import { ConfirmSubmit } from "@/components/ui/confirm-dialog";
import type { UserRole } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Admin users" };

type SearchParams = Promise<{
  q?: string;
  role?: string;
  page?: string;
  updated?: string;
  error?: string;
}>;

const FILTERS: { value: "all" | UserRole; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "admin", label: "Admins" },
  { value: "customer", label: "Customers" },
];

function pageHref(query: string | undefined, role: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (role && role !== "all") params.set("role", role);
  if (page > 1) params.set("page", String(page));
  const value = params.toString();
  return value ? `/admin/users?${value}` : "/admin/users";
}

function RoleBadge({ role }: { role: UserRole }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.14em]",
        isAdmin
          ? "border-accent/40 bg-accent/10 text-accent"
          : "border-line-strong bg-bone/5 text-bone-dim",
      )}
    >
      {isAdmin ? (
        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
      ) : (
        <UserRound className="h-3 w-3" aria-hidden="true" />
      )}
      {isAdmin ? "Admin" : "Customer"}
    </span>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [params, session] = await Promise.all([searchParams, getAdminSession()]);
  const page = Math.max(1, Number(params.page) || 1);
  const role = params.role === "admin" || params.role === "customer" ? params.role : "all";
  const data = await getAdminUsers({ query: params.q, role, page });

  return (
    <>
      <AdminPageHeader
        eyebrow="Configure"
        title="Admin users."
        description="Who can open this dashboard. Customers keep their accounts but never reach admin pages."
      />

      {params.updated === "1" ? <FlashToast message="Role updated." /> : null}

      {params.error === "self" ? (
        <p
          role="alert"
          className="mb-5 rounded-[var(--radius-card)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm leading-relaxed text-red-300"
        >
          You cannot remove your own admin access. Ask another admin to change your role.
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-5">
          <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="relative flex-1">
              <label htmlFor="q" className="eyebrow text-bone-dim">
                Search people
              </label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={params.q ?? ""}
                placeholder="Email or name"
                className={cn(controlClasses, "mt-1.5 pl-10")}
              />
              <Search
                className="pointer-events-none absolute bottom-3.5 left-3 h-4 w-4 text-bone-dim"
                aria-hidden="true"
              />
            </div>
            {role !== "all" ? <input type="hidden" name="role" value={role} /> : null}
            <div className="flex gap-2">
              <button type="submit" className={buttonClasses("primary")}>
                Search
              </button>
              {params.q ? (
                <Link
                  href={role === "all" ? "/admin/users" : `/admin/users?role=${role}`}
                  className={buttonClasses("secondary")}
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by role">
            {FILTERS.map((filter) => {
              const active = role === filter.value;
              const count =
                filter.value === "admin"
                  ? data.adminCount
                  : filter.value === "customer"
                    ? data.customerCount
                    : data.adminCount + data.customerCount;
              return (
                <Link
                  key={filter.value}
                  href={
                    filter.value === "all"
                      ? params.q
                        ? `/admin/users?q=${encodeURIComponent(params.q)}`
                        : "/admin/users"
                      : `/admin/users?role=${filter.value}${
                          params.q ? `&q=${encodeURIComponent(params.q)}` : ""
                        }`
                  }
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-xs transition-colors",
                    active
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-line text-bone-dim hover:border-line-strong hover:text-bone",
                  )}
                >
                  {filter.label}
                  <span className="font-mono text-[10px] tracking-[0.1em]">{count}</span>
                </Link>
              );
            })}
          </div>

          <AdminPanel
            title="Team and customers"
            meta={
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                {data.count} {data.count === 1 ? "account" : "accounts"}
              </span>
            }
          >
            {data.profiles.length === 0 ? (
              <AdminEmpty
                title={params.q ? "No accounts match that search." : "No accounts yet."}
                body={
                  params.q
                    ? "Try a different email or name."
                    : "Accounts appear here after checkout or when you invite an admin."
                }
              />
            ) : (
              <>
                <ul className="divide-y divide-line md:hidden">
                  {data.profiles.map((profile) => {
                    const isSelf = profile.id === session?.userId;
                    const nextRole: UserRole = profile.role === "admin" ? "customer" : "admin";
                    return (
                      <li key={profile.id} className="px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm text-bone">
                              {profile.full_name || "No name"}
                              {isSelf ? (
                                <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                                  You
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-bone-dim">{profile.email}</p>
                          </div>
                          <RoleBadge role={profile.role} />
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                            Joined {formatOrderDate(profile.created_at)}
                          </span>
                          {isSelf ? (
                            <span className="text-xs text-bone-dim">Current account</span>
                          ) : (
                            <form action={setUserRoleAction}>
                              <input type="hidden" name="id" value={profile.id} />
                              <input type="hidden" name="role" value={nextRole} />
                              {nextRole === "customer" ? (
                                <ConfirmSubmit
                                  title={`Remove admin access from ${profile.full_name || profile.email}?`}
                                  description="They stay signed in as a customer. They will lose access to every admin page immediately."
                                  confirmLabel="Make customer"
                                  className={buttonClasses("secondary", "min-h-10")}
                                >
                                  Make customer
                                </ConfirmSubmit>
                              ) : (
                                <button
                                  type="submit"
                                  className={buttonClasses("secondary", "min-h-10")}
                                >
                                  Make admin
                                </button>
                              )}
                            </form>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="hidden md:block">
                  <TableShell>
                    <thead>
                      <tr>
                        <Th>Person</Th>
                        <Th>Role</Th>
                        <Th>Joined</Th>
                        <Th className="text-right">Actions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.profiles.map((profile) => {
                        const isSelf = profile.id === session?.userId;
                        const nextRole: UserRole = profile.role === "admin" ? "customer" : "admin";
                        return (
                          <tr key={profile.id} className="transition-colors hover:bg-bone/[0.03]">
                            <Td>
                              <span className="block text-sm text-bone">
                                {profile.full_name || "No name"}
                                {isSelf ? (
                                  <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                                    You
                                  </span>
                                ) : null}
                              </span>
                              <span className="block text-xs text-bone-dim">{profile.email}</span>
                            </Td>
                            <Td>
                              <RoleBadge role={profile.role} />
                            </Td>
                            <Td className="whitespace-nowrap font-mono text-[11px] text-bone-dim">
                              {formatOrderDate(profile.created_at)}
                            </Td>
                            <Td>
                              <div className="flex justify-end">
                                {isSelf ? (
                                  <span className="text-xs text-bone-dim">Current account</span>
                                ) : (
                                  <form action={setUserRoleAction}>
                                    <input type="hidden" name="id" value={profile.id} />
                                    <input type="hidden" name="role" value={nextRole} />
                                    {nextRole === "customer" ? (
                                      <ConfirmSubmit
                                        title={`Remove admin access from ${profile.full_name || profile.email}?`}
                                        description="They stay signed in as a customer. They will lose access to every admin page immediately."
                                        confirmLabel="Make customer"
                                        className={buttonClasses("secondary", "min-h-10")}
                                      >
                                        Make customer
                                      </ConfirmSubmit>
                                    ) : (
                                      <button
                                        type="submit"
                                        className={buttonClasses("secondary", "min-h-10")}
                                      >
                                        Make admin
                                      </button>
                                    )}
                                  </form>
                                )}
                              </div>
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </TableShell>
                </div>
              </>
            )}
          </AdminPanel>

          {data.pageCount > 1 ? (
            <nav className="flex items-center justify-between gap-3" aria-label="User pages">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">
                Page {data.page} of {data.pageCount}
              </p>
              <div className="flex gap-2">
                {data.page > 1 ? (
                  <Link
                    href={pageHref(params.q, role, data.page - 1)}
                    className={buttonClasses("secondary", "min-h-10")}
                  >
                    Previous
                  </Link>
                ) : null}
                {data.page < data.pageCount ? (
                  <Link
                    href={pageHref(params.q, role, data.page + 1)}
                    className={buttonClasses("secondary", "min-h-10")}
                  >
                    Next
                  </Link>
                ) : null}
              </div>
            </nav>
          ) : null}
        </div>

        <div className="min-w-0 space-y-5">
          <AdminPanel
            title="Invite an admin"
            meta={
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
                Email
              </span>
            }
          >
            <InviteAdminForm />
            <p className="border-t border-line px-4 py-3 text-xs leading-relaxed text-bone-dim sm:px-5">
              We email a Supabase invite link. The new admin sets their own password on the
              accept-invite page, then lands in the dashboard.
            </p>
          </AdminPanel>

          <AdminPanel title="Access rules">
            <ul className="space-y-3 px-4 py-4 text-xs leading-relaxed text-bone-dim sm:px-5">
              <li>Every admin route checks the profile role on the server.</li>
              <li>Customers sign in only to view their account, never the dashboard.</li>
              <li>You cannot demote the account you are signed in with.</li>
            </ul>
          </AdminPanel>
        </div>
      </div>
    </>
  );
}
