"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import {
  ArrowUpRight,
  Boxes,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDialog } from "@/hooks/use-dialog";
import { signOutAction } from "@/lib/admin/auth-actions";

const NAV_GROUPS = [
  {
    label: "Store",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/collections", label: "Collections", icon: Layers },
      { href: "/admin/inventory", label: "Inventory", icon: Boxes },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/discounts", label: "Discounts", icon: Tag },
      { href: "/admin/subscribers", label: "Subscribers", icon: Send },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/messages", label: "Messages", icon: Mail },
    ],
  },
  {
    label: "Configure",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/users", label: "Admin users", icon: ShieldCheck },
    ],
  },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="min-h-0 flex-1 overflow-y-auto">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-4 last:mb-0">
          <p className="px-3 pb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-bone-dim">
            {group.label}
          </p>
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-[var(--radius-card)] px-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] transition-colors",
                    active
                      ? "bg-accent text-accent-ink"
                      : "text-bone-dim hover:bg-bone/5 hover:text-bone",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/admin"
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-3"
      aria-label="Grip On admin dashboard"
    >
      <Image
        src="/brand/wordmark.svg"
        alt="Grip On"
        width={375}
        height={96}
        className="h-7 w-auto"
        priority
        unoptimized
      />
      <span className="eyebrow border-l border-line pl-3 text-bone-dim">Admin</span>
    </Link>
  );
}

function Account({ email, name }: { email: string; name: string }) {
  return (
    <div className="border-t border-line pt-4">
      <p className="truncate text-sm text-bone">{name || "Store admin"}</p>
      <p className="mt-0.5 truncate font-mono text-[10px] tracking-[0.08em] text-bone-dim">{email}</p>
      <div className="mt-3 flex flex-col gap-1">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 rounded-[var(--radius-card)] px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:bg-bone/5 hover:text-bone"
        >
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          View store
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-card)] px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:bg-bone/5 hover:text-bone"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({
  email,
  name,
  children,
}: {
  email: string;
  name: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const drawerRef = useDialog<HTMLDivElement>(open, close);

  return (
    <div className="min-h-svh bg-ink text-bone">
      <a href="#admin-content" className="skip-link">
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-ink-soft px-4 py-5 lg:flex">
        <Brand />
        <div className="mt-8 flex min-h-0 flex-1 flex-col">
          <AdminNav />
          <Account email={email} name={name} />
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-line bg-ink/95 px-4 backdrop-blur lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] border border-line text-bone transition-colors hover:border-bone"
          aria-label="Open admin menu"
          aria-expanded={open}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={close}
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Admin menu"
            className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col border-l border-line bg-ink-soft px-4 py-5"
          >
            <div className="flex items-center justify-between gap-4">
              <Brand onClick={close} />
              <button
                type="button"
                onClick={close}
                className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] border border-line text-bone"
                aria-label="Close admin menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-8 flex min-h-0 flex-1 flex-col">
              <AdminNav onNavigate={close} />
              <Account email={email} name={name} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <main id="admin-content" className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
