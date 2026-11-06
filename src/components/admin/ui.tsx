import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/orders/format";
import type { OrderStatus } from "@/lib/supabase/types";

const statusTones: Record<OrderStatus, string> = {
  pending: "border-accent/40 bg-accent/10 text-accent",
  confirmed: "border-line-strong bg-bone/5 text-bone",
  packed: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  shipped: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  delivered: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  cancelled: "border-red-400/30 bg-red-400/10 text-red-300",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.14em]",
        statusTones[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function DeliveryQuoteBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-accent">
      Quote delivery
    </span>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow text-accent">{eyebrow}</p>
        <h1 className="display mt-2 text-h2">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-bone-dim">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="eyebrow text-bone-dim">{label}</p>
      <p className="display mt-3 text-4xl text-bone sm:text-5xl">{value}</p>
      <p className="mt-3 text-xs leading-relaxed text-bone-dim">{hint}</p>
      {href ? (
        <span className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          View <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </span>
      ) : null}
    </>
  );

  const className =
    "flex flex-col rounded-[var(--radius-card)] border border-line bg-ink-soft p-5 transition-colors";

  if (href) {
    return (
      <Link href={href} className={cn(className, "hover:border-line-strong")}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export function AdminPanel({
  title,
  meta,
  action,
  children,
  className,
}: {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-[var(--radius-card)] border border-line bg-ink-soft",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-3">
          <h2 className="eyebrow text-bone">{title}</h2>
          {meta}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminEmpty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start px-5 py-10">
      <p className="text-sm font-medium text-bone">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-bone-dim">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-line px-4 py-3 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-bone-dim sm:px-5",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-line/70 px-4 py-3.5 text-sm text-bone sm:px-5", className)}>
      {children}
    </td>
  );
}
