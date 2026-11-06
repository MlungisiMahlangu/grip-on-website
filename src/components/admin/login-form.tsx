"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { signInAction, type SignInState } from "@/lib/admin/auth-actions";
import { buttonClasses } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-field";

const initialState: SignInState = {};

export function LoginForm({
  next,
  forbidden,
}: {
  next: string;
  forbidden: boolean;
}) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />

      {forbidden && !state.error ? (
        <p
          role="status"
          className="rounded-[var(--radius-card)] border border-accent/40 bg-accent/10 px-4 py-3 text-sm leading-relaxed text-bone"
        >
          That account is signed in but does not have admin access. Sign in with an admin account.
        </p>
      ) : null}

      {state.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-card)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm leading-relaxed text-red-300"
        >
          {state.error}
        </p>
      ) : null}

      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        inputMode="email"
        placeholder="you@example.com"
        required
      />

      <div className="relative">
        <TextField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Your password"
          required
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
        <LogIn aria-hidden="true" />
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
