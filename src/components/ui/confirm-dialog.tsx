"use client";

import { useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Modal } from "@/components/ui/modal";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  pending = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  pending?: boolean;
  children?: ReactNode;
}) {
  return (
    <Modal
      open={open}
      onClose={() => {
        if (!pending) onClose();
      }}
      title={title}
      description={description}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className={buttonClasses("secondary")}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={cn(
              buttonClasses("primary"),
              tone === "danger" &&
                "border-red-400/60 bg-red-500 text-white hover:border-red-400 hover:bg-red-400",
            )}
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      }
    >
      {children ? <div className="text-sm leading-relaxed text-bone-dim">{children}</div> : null}
    </Modal>
  );
}

export function ConfirmSubmit({
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  tone = "danger",
  className,
  children,
  disabled,
  formAction,
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  formAction?: string | ((formData: FormData) => void | Promise<void>);
}) {
  const [open, setOpen] = useState(false);
  const hiddenRef = useRef<HTMLButtonElement>(null);
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled || pending}
        className={className}
      >
        {children}
      </button>

      <button
        ref={hiddenRef}
        type="submit"
        formAction={formAction}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          hiddenRef.current?.click();
        }}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        tone={tone}
        pending={pending}
      />
    </>
  );
}
