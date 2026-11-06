import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { getAdminMessages, MESSAGE_STATUSES } from "@/lib/admin/operations-queries";
import { formatOrderDate } from "@/lib/orders/format";
import type { ContactMessageStatus } from "@/lib/supabase/types";
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

export const metadata: Metadata = { title: "Messages" };

type SearchParams = Promise<{ status?: string; q?: string; page?: string }>;

const STATUS_LABELS: Record<ContactMessageStatus, string> = {
  new: "New",
  read: "Read",
  archived: "Archived",
};

const STATUS_TONES: Record<ContactMessageStatus, string> = {
  new: "border-accent/40 bg-accent/10 text-accent",
  read: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  archived: "border-line-strong bg-bone/5 text-bone-dim",
};

function MessageStatusBadge({ status }: { status: ContactMessageStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.14em]",
        STATUS_TONES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function pageHref(params: { status?: string; q?: string }, page: number) {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.q) query.set("q", params.q);
  if (page > 1) query.set("page", String(page));
  const value = query.toString();
  return value ? `/admin/messages?${value}` : "/admin/messages";
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status = MESSAGE_STATUSES.includes(params.status as ContactMessageStatus)
    ? (params.status as ContactMessageStatus)
    : undefined;
  const page = Math.max(1, Number(params.page) || 1);
  const data = await getAdminMessages({ status: status ?? "all", query: params.q, page });
  const total = Object.values(data.statusCounts).reduce((sum, count) => sum + count, 0);
  const filter = { status: status ?? "all", q: params.q };

  return (
    <>
      <AdminPageHeader
        eyebrow="People"
        title="Messages."
        description="Enquiries sent through the storefront contact form. Replies go out from your own email."
      />

      <form method="get" className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <div className="relative flex-1">
          <label htmlFor="q" className="eyebrow text-bone-dim">
            Search messages
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Name, email, subject or content"
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
            <Link href={pageHref({ status: status ?? "all" }, 1)} className={buttonClasses("secondary")}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Filter by status">
        <Link
          href={pageHref({ q: params.q }, 1)}
          aria-current={!status ? "true" : undefined}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-card)] border px-3 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
            !status
              ? "border-accent bg-accent text-accent-ink"
              : "border-line text-bone-dim hover:border-line-strong hover:text-bone",
          )}
        >
          All <span className="ml-1.5">{total}</span>
        </Link>
        {MESSAGE_STATUSES.map((value) => (
          <Link
            key={value}
            href={pageHref({ status: value, q: params.q }, 1)}
            aria-current={status === value ? "true" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-card)] border px-3 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
              status === value
                ? "border-accent bg-accent text-accent-ink"
                : "border-line text-bone-dim hover:border-line-strong hover:text-bone",
            )}
          >
            {STATUS_LABELS[value]} <span className="ml-1.5">{data.statusCounts[value]}</span>
          </Link>
        ))}
      </div>

      <AdminPanel
        title="Inbox"
        meta={
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
            {data.count} {data.count === 1 ? "message" : "messages"}
          </span>
        }
      >
        {data.messages.length === 0 ? (
          <AdminEmpty
            title={params.q ? "No messages match that search." : "No messages here."}
            body={
              params.q
                ? "Try a different name, email or subject."
                : "Messages from the contact form land here. New enquiries are marked until you read them."
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-line md:hidden">
              {data.messages.map((message) => (
                <li key={message.id}>
                  <Link
                    href={`/admin/messages/${message.id}`}
                    className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-bone/[0.03]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-sm text-bone">{message.subject}</span>
                      <MessageStatusBadge status={message.status} />
                    </div>
                    <span className="truncate text-xs text-bone-dim">
                      {message.name} · {message.email}
                    </span>
                    <span className="line-clamp-2 text-xs leading-relaxed text-bone-dim">
                      {message.message}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                      {formatOrderDate(message.created_at, true)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden md:block">
              <TableShell>
                <thead>
                  <tr>
                    <Th>Message</Th>
                    <Th>From</Th>
                    <Th>Received</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.messages.map((message) => (
                    <tr key={message.id} className="transition-colors hover:bg-bone/[0.03]">
                      <Td>
                        <Link
                          href={`/admin/messages/${message.id}`}
                          className="block text-sm text-bone hover:text-accent"
                        >
                          {message.subject}
                        </Link>
                        <span className="block max-w-[20rem] truncate text-xs text-bone-dim">
                          {message.message}
                        </span>
                      </Td>
                      <Td>
                        <span className="block text-sm text-bone">{message.name}</span>
                        <span className="block truncate text-xs text-bone-dim">{message.email}</span>
                      </Td>
                      <Td className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.1em] text-bone-dim">
                        {formatOrderDate(message.created_at, true)}
                      </Td>
                      <Td>
                        <MessageStatusBadge status={message.status} />
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
        <nav className="mt-5 flex items-center justify-between gap-3" aria-label="Message pages">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">
            Page {data.page} of {data.pageCount}
          </p>
          <div className="flex gap-2">
            {data.page > 1 ? (
              <Link href={pageHref(filter, data.page - 1)} className={buttonClasses("secondary", "min-h-10")}>
                Previous
              </Link>
            ) : null}
            {data.page < data.pageCount ? (
              <Link href={pageHref(filter, data.page + 1)} className={buttonClasses("secondary", "min-h-10")}>
                Next
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}
