"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buttonClasses } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-field";

type Phase = "checking" | "ready" | "invalid";

function readInviteParams() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const search = new URLSearchParams(window.location.search);
  const error =
    hash.get("error_description") ??
    search.get("error_description") ??
    hash.get("error") ??
    search.get("error");
  return {
    error,
    accessToken: hash.get("access_token"),
    refreshToken: hash.get("refresh_token"),
    code: search.get("code"),
    tokenHash: search.get("token_hash"),
  };
}

export function AcceptInviteForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    const params = readInviteParams();
    const supabase = createClient();

    async function acceptInvite() {
      if (params.error) {
        setError(params.error);
        setPhase("invalid");
        return;
      }

      let failure: string | null = null;

      if (params.accessToken && params.refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: params.accessToken,
          refresh_token: params.refreshToken,
        });
        failure = error?.message ?? null;
      } else if (params.code) {
        const { error } = await supabase.auth.exchangeCodeForSession(params.code);
        failure = error?.message ?? null;
      } else if (params.tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: params.tokenHash,
          type: "invite",
        });
        failure = error?.message ?? null;
      } else {
        if (!active) return;
        setError("Open the invite link from your email to set a password.");
        setPhase("invalid");
        return;
      }

      if (!active) return;

      if (failure) {
        setError(failure);
        setPhase("invalid");
        return;
      }

      window.history.replaceState(null, "", window.location.pathname);
      setPhase("ready");
    }

    void acceptInvite();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setPending(false);
      setError(updateError.message);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  if (phase === "checking") {
    return (
      <p role="status" className="mt-8 text-sm text-bone-dim">
        Checking your invite…
      </p>
    );
  }

  if (phase === "invalid") {
    return (
      <div className="mt-8 space-y-5">
        <p
          role="alert"
          className="rounded-[var(--radius-card)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-body leading-relaxed text-red-300"
        >
          {error ?? "This invite link is invalid or has expired."}
        </p>
        <p className="text-body leading-relaxed text-bone-dim">
          Invite links work once and expire quickly. Ask an admin to send a new invite to your
          email.
        </p>
        <Link href="/admin/login" className={buttonClasses("secondary", "w-full")}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
      {error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-card)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-body leading-relaxed text-red-300"
        >
          {error}
        </p>
      ) : null}

      <TextField
        label="New password"
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="At least 8 characters"
        required
        minLength={8}
        className="pr-12"
        hint="Used every time you sign in to the dashboard."
      />

      <div className="relative">
        <TextField
          label="Confirm password"
          name="confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="Type it again"
          required
          minLength={8}
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          className="absolute right-1 top-[26px] flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] text-bone-dim transition-colors hover:text-bone"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <button type="submit" disabled={pending} className={buttonClasses("primary", "w-full")}>
        <ShieldCheck aria-hidden="true" />
        {pending ? "Setting password…" : "Set password and open dashboard"}
      </button>
    </form>
  );
}
