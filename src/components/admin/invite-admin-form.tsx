"use client";

import { useActionState, useEffect, useRef } from "react";
import { inviteAdminAction } from "@/lib/admin/user-actions";
import type { FormState } from "@/lib/admin/schemas";
import { toast } from "@/lib/toast";
import { buttonClasses } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-field";

const initialState: FormState = {};

export function InviteAdminForm() {
  const [state, formAction, pending] = useActionState(inviteAdminAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      toast.success(state.success);
    }
  }, [state.success]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 px-4 py-4 sm:px-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          required
          placeholder="name@example.com"
          error={state.fieldErrors?.email}
        />
        <TextField
          label="Full name (optional)"
          name="fullName"
          maxLength={80}
          placeholder="First and last name"
          error={state.fieldErrors?.fullName}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClasses("primary")}>
          {pending ? "Sending invite…" : "Send invite"}
        </button>
        {state.success ? (
          <p role="status" className="text-xs leading-relaxed text-emerald-300">
            {state.success}
          </p>
        ) : state.error ? (
          <p role="alert" className="text-xs leading-relaxed text-red-300">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
