import type { Metadata } from "next";
import Link from "next/link";
import { Download, Pause, Play, Search } from "lucide-react";
import { getAdminSubscribers } from "@/lib/admin/operations-queries";
import { setSubscriberActiveAction } from "@/lib/admin/subscriber-actions";
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
import { SubscriberForm } from "@/components/admin/subscriber-form";

export const metadata: Metadata = { title: "Subscribers" };

type SearchParams = Promise<{ status?: string; q?: string; page?: string }>;

const STATUS_LABELS: Record<string, string> = {
  checkout: "Checkout",
  contact: "Contact form",
  admin: "Added by admin",
  footer: "Footer",
};

function pageHref(params: { status?: string; q?: string }, page: number) {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.q) query.set("q", params.q);
  if (page > 1) query.set("page", String(page));
  const value = query.toString();
  return value ? `/admin/subscribers?${value}` : "/admin/subscribers";
}

function ExportLink({ status, q }: { status?: string; q?: string }) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (q) params.set("q", q);
  const value = params.toString();
  return (
    <a
      href={`/admin/subscribers/export${value ? `?${value}` : ""}`}
      className={buttonClasses("secondary")}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Export CSV
    </a>
  );
}

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status =
    params.status === "active" || params.status === "inactive" ? params.status : undefined;
  const page = Math.max(1, Number(params.page) || 1);
  const data = await getAdminSubscribers({ status: status ?? "all", query: params.q, page });
  const total = data.activeCount + data.inactiveCount;

  return (
    <>
      <AdminPageHeader
        eyebrow="Marketing"
        title="Subscribers."
        description="People who opted in at checkout, in the contact form, or were added by hand."
        action={<ExportLink status={status ?? "all"} q={params.q} />}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--radius-card)] border border-line bg-ink-soft px-4 py-4">
          <p className="eyebrow text-bone-dim">All</p>
          <p className="display mt-2 text-3xl text-bone">{total}</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-line bg-ink-soft px-4 py-4">
          <p className="eyebrow text-bone-dim">Subscribed</p>
          <p className="display mt-2 text-3xl text-bone">{data.activeCount}</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-line bg-ink-soft px-4 py-4">
          <p className="eyebrow text-bone-dim">Unsubscribed</p>
          <p className="display mt-2 text-3xl text-bone">{data.inactiveCount}</p>
        </div>
      </div>

      <AdminPanel title="Add someone" className="mb-6">
        <SubscriberForm />
      </AdminPanel>

      <form method="get" className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <div className="relative flex-1">
          <label htmlFor="q" className="eyebrow text-bone-dim">
            Search subscribers
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Email address"
            className={cn(controlClasses, "mt-1.5 pl-10")}
          />
          <Search
            className="pointer-events-none absolute bottom-3.5 left-3 h-4 w-4 text-bone-dim"
            aria-hidden="true"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={buttonClasses("primary")}>
            Search
          </button>
          {params.q ? (
            <Link
              href={pageHref({ status: status ?? "all" }, 1)}
              className={buttonClasses("secondary")}
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Filter by status">
        {[
          { value: undefined, label: "All" },
          { value: "active", label: "Subscribed" },
          { value: "inactive", label: "Unsubscribed" },
        ].map((option) => (
          <Link
            key={option.label}
            href={pageHref({ status: option.value, q: params.q }, 1)}
            aria-current={status === option.value ? "true" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-card)] border px-3 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
              status === option.value
                ? "border-accent bg-accent text-accent-ink"
                : "border-line text-bone-dim hover:border-line-strong hover:text-bone",
            )}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <AdminPanel
        title="Subscriber list"
        meta={
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
            {data.count} {data.count === 1 ? "result" : "results"}
          </span>
        }
      >
        {data.subscribers.length === 0 ? (
          <AdminEmpty
            title={params.q ? "No subscribers match that search." : "No subscribers yet."}
            body={
              params.q
                ? "Try a different email address."
                : "Checkout and contact form opt-ins land here, or add someone by hand above."
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-line md:hidden">
              {data.subscribers.map((subscriber) => (
                <li key={subscriber.id} className="flex items-start justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-bone">{subscriber.email}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                      {STATUS_LABELS[subscriber.source] ?? subscriber.source} ·{" "}
                      {formatOrderDate(subscriber.created_at)}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        subscriber.is_active ? "text-emerald-300" : "text-bone-dim",
                      )}
                    >
                      {subscriber.is_active ? "Subscribed" : "Unsubscribed"}
                    </p>
                  </div>
                  <form action={setSubscriberActiveAction}>
                    <input type="hidden" name="id" value={subscriber.id} />
                    <input type="hidden" name="value" value={String(!subscriber.is_active)} />
                    <button
                      type="submit"
                      className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] border border-line text-bone-dim transition-colors hover:border-bone hover:text-bone"
                      aria-label={subscriber.is_active ? "Unsubscribe" : "Resubscribe"}
                      title={subscriber.is_active ? "Unsubscribe" : "Resubscribe"}
                    >
                      {subscriber.is_active ? (
                        <Pause className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Play className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </form>
                </li>
              ))}
            </ul>

            <div className="hidden md:block">
              <TableShell>
                <thead>
                  <tr>
                    <Th>Email</Th>
                    <Th>Source</Th>
                    <Th>Joined</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="transition-colors hover:bg-bone/[0.03]">
                      <Td className="max-w-[18rem] truncate font-mono text-xs text-bone">
                        {subscriber.email}
                      </Td>
                      <Td className="text-xs text-bone-dim">
                        {STATUS_LABELS[subscriber.source] ?? subscriber.source}
                      </Td>
                      <Td className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                        {formatOrderDate(subscriber.created_at)}
                      </Td>
                      <Td
                        className={cn(
                          "font-mono text-[10px] uppercase tracking-[0.12em]",
                          subscriber.is_active ? "text-emerald-300" : "text-bone-dim",
                        )}
                      >
                        {subscriber.is_active ? "Subscribed" : "Unsubscribed"}
                      </Td>
                      <Td>
                        <div className="flex justify-end">
                          <form action={setSubscriberActiveAction}>
                            <input type="hidden" name="id" value={subscriber.id} />
                            <input type="hidden" name="value" value={String(!subscriber.is_active)} />
                            <button
                              type="submit"
                              className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] border border-line text-bone-dim transition-colors hover:border-bone hover:text-bone"
                              aria-label={subscriber.is_active ? "Unsubscribe" : "Resubscribe"}
                              title={subscriber.is_active ? "Unsubscribe" : "Resubscribe"}
                            >
                              {subscriber.is_active ? (
                                <Pause className="h-4 w-4" aria-hidden="true" />
                              ) : (
                                <Play className="h-4 w-4" aria-hidden="true" />
                              )}
                            </button>
                          </form>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            </div>
          </>
        )}
      </AdminPanel>

      {data.pageCount > 1 ? (
        <nav className="mt-5 flex items-center justify-between gap-3" aria-label="Subscriber pages">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">
            Page {data.page} of {data.pageCount}
          </p>
          <div className="flex gap-2">
            {data.page > 1 ? (
              <Link
                href={pageHref({ status, q: params.q }, data.page - 1)}
                className={buttonClasses("secondary", "min-h-10")}
              >
                Previous
              </Link>
            ) : null}
            {data.page < data.pageCount ? (
              <Link
                href={pageHref({ status, q: params.q }, data.page + 1)}
                className={buttonClasses("secondary", "min-h-10")}
              >
                Next
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}
