"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { sendContactMessageAction, type ContactFormState } from "@/lib/contact/actions";
import { buttonClasses } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/form-field";

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessageAction, initialState);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  if (state.success) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-4 rounded-[var(--radius-card)] border border-emerald-400/30 bg-emerald-400/[0.06] p-6 sm:p-8"
      >
        <CheckCircle2 className="h-6 w-6 text-emerald-300" aria-hidden="true" />
        <div>
          <p className="text-lg font-medium text-bone">Message received.</p>
          <p className="mt-2 max-w-md text-body leading-relaxed text-bone-dim">{state.success}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/shop" className={buttonClasses("primary")}>
            Back to the shop
          </Link>
          <Link href="/track-order" className={buttonClasses("secondary")}>
            Track an order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-card)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-body leading-relaxed text-red-300"
        >
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Your name"
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={60}
          placeholder="First and last name"
          error={state.fieldErrors?.name}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          error={state.fieldErrors?.email}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Mobile number"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          required
          maxLength={10}
          pattern="[0-9]{10}"
          value={phone}
          onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="0660488468"
          hint="10 digits, numbers only."
          error={state.fieldErrors?.phone}
        />
        <TextField
          label="Subject"
          name="subject"
          required
          minLength={3}
          maxLength={100}
          placeholder="Order, sizing, wholesale…"
          error={state.fieldErrors?.subject}
        />
      </div>

      <TextAreaField
        label="Message"
        name="message"
        required
        minLength={10}
        maxLength={1000}
        value={message}
        onChange={(event) => setMessage(event.target.value.slice(0, 1000))}
        placeholder="Tell us what you need and include your order number if you have one."
        hint={`${message.length} of 1,000 characters`}
        className="min-h-40"
        error={state.fieldErrors?.message}
      />

      <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border border-line px-3 py-2.5 has-[:checked]:border-accent/50 has-[:checked]:bg-accent/5">
        <input
          type="checkbox"
          name="subscribe"
          className="mt-1 h-4 w-4 accent-[var(--accent)]"
        />
        <span>
          <span className="block text-sm text-bone">Email me new arrivals</span>
          <span className="mt-0.5 block text-xs text-bone-dim">
            Occasional updates when new gear lands. No spam, unsubscribe any time.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button type="submit" disabled={pending} className={buttonClasses("primary")}>
          <Send aria-hidden="true" />
          {pending ? "Sending…" : "Send message"}
        </button>
        <p className="text-xs text-bone-dim">We reply within one working day.</p>
      </div>
    </form>
  );
}
