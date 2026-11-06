import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export const controlClasses =
  "min-h-11 w-full rounded-[var(--radius-card)] border border-line bg-ink-soft px-3 py-2.5 text-sm text-bone transition-colors placeholder:text-bone-dim/80 hover:border-line-strong focus:border-accent focus:outline-none aria-[invalid=true]:border-red-400/70";

const labelClasses = "eyebrow text-bone-dim";

function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className={labelClasses}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-bone-dim/80">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(name: string, error?: string, hint?: string) {
  if (error) return `${name}-error`;
  if (hint) return `${name}-hint`;
  return undefined;
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name"> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  fieldClassName?: string;
};

export function TextField({
  label,
  name,
  error,
  hint,
  fieldClassName,
  className,
  ...props
}: TextFieldProps) {
  return (
    <FieldShell label={label} htmlFor={name} error={error} hint={hint} className={fieldClassName}>
      <input
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(name, error, hint)}
        className={cn(controlClasses, className)}
        {...props}
      />
    </FieldShell>
  );
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "name"> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  fieldClassName?: string;
  children: ReactNode;
};

export function SelectField({
  label,
  name,
  error,
  hint,
  fieldClassName,
  className,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <FieldShell label={label} htmlFor={name} error={error} hint={hint} className={fieldClassName}>
      <select
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(name, error, hint)}
        className={cn(controlClasses, "appearance-none pr-8", className)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name"> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  fieldClassName?: string;
};

export function TextAreaField({
  label,
  name,
  error,
  hint,
  fieldClassName,
  className,
  ...props
}: TextAreaFieldProps) {
  return (
    <FieldShell label={label} htmlFor={name} error={error} hint={hint} className={fieldClassName}>
      <textarea
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(name, error, hint)}
        className={cn(controlClasses, "min-h-24 resize-y", className)}
        {...props}
      />
    </FieldShell>
  );
}
