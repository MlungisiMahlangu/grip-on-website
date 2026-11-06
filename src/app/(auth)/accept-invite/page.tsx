import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { AcceptInviteForm } from "@/components/auth/accept-invite-form";

export const metadata: Metadata = {
  title: "Accept admin invite",
  robots: { index: false, follow: false },
};

export default function AcceptInvitePage() {
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

      <main id="main-content" className="flex flex-1 items-center justify-center px-5 py-14 sm:px-10">
        <div className="w-full max-w-sm">
          <p className="eyebrow text-accent">Admin access</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">Set your password.</h1>
          <p className="mt-3 text-sm leading-relaxed text-bone-dim">
            You have been invited to the Grip On dashboard. Choose a password to finish setting up
            your account.
          </p>
          <AcceptInviteForm />
        </div>
      </main>
    </div>
  );
}
