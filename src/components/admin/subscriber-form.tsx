"use client";

import { useActionState } from "react";
import { addSubscriberAction } from "@/lib/admin/subscriber-actions";
import type { FormState } from "@/lib/admin/schemas";
import { buttonClasses } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-field";

const initialState: FormState = {};

export function SubscriberForm() {
  const [state, formAction, pending] = useActionState(addSubscriberAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-end sm:px-5">
      <TextField
        label="Add subscriber"
        name="email"
        type="email"
        inputMode="email"
        required
        placeholder="name@example.com"
        className="sm:min-w-72"
        fieldClassName="flex-1"
        error={state.fieldErrors?.email}
      />
      <button type="submit" disabled={pending} className={buttonClasses("primary")}>
        {pending ? "Adding…" : "Add"}
      </button>
      {state.success ? (
        <p role="status" className="text-xs text-emerald-300 sm:pb-3">
          {state.success}
        </p>
      ) : state.error ? (
        <p role="alert" className="text-xs text-red-300 sm:pb-3">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
