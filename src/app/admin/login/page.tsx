import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const params = await searchParams;
  const next = params.next?.startsWith("/admin") ? params.next : "/admin";

  return (
    <div className="flex min-h-svh flex-col bg-ink">
      <header className="border-b border-line">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Wordmark className="h-7" priority />
            <span className="eyebrow border-l border-line pl-4 text-bone-dim">Admin</span>
          </div>
          <Link href="/" className="eyebrow text-bone-dim transition-colors hover:text-bone">
            View store
          </Link>
        </div>
      </header>

      <main id="main-content" className="grid flex-1 lg:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-ink-soft p-12 lg:flex">
          <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
            <div className="absolute -left-24 top-1/3 h-96 w-96 rounded-full border border-bone" />
            <div className="absolute -left-10 top-1/2 h-72 w-72 rounded-full border border-bone" />
            <div className="absolute left-16 top-2/3 h-48 w-48 rounded-full border border-bone" />
          </div>
          <p className="eyebrow relative text-accent">Back office</p>
          <div className="relative">
            <p className="display text-[clamp(4rem,7vw,7rem)]" aria-hidden="true">
              Run the
              <br />
              floor<span className="text-accent">.</span>
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-bone-dim">
              Orders, stock and the full range in one place. Everything here is live — no staging,
              no placeholders.
            </p>
          </div>
          <p className="eyebrow relative text-bone-dim">Grip On · Johannesburg</p>
        </section>

        <section className="flex items-center justify-center px-5 py-14 sm:px-10">
          <div className="w-full max-w-sm">
            <p className="eyebrow text-accent">Admin access</p>
            <h1 className="display mt-3 text-4xl sm:text-5xl">Sign in.</h1>
            <p className="mt-3 text-sm leading-relaxed text-bone-dim">
              Use the admin account configured in Supabase. Customers cannot reach this area.
            </p>
            <LoginForm next={next} forbidden={params.reason === "forbidden"} />
          </div>
        </section>
      </main>
    </div>
  );
}
