"use client";

import { useId, type ReactNode } from "react";
import { X } from "lucide-react";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const ref = useDialog<HTMLDivElement>(open, onClose);
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/85 px-4 py-6 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "flex max-h-[calc(100svh-3rem)] w-full max-w-xl flex-col overflow-hidden rounded-[var(--radius-card)] border border-line-strong bg-ink-raised shadow-2xl",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="display text-h3 text-bone">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-caption leading-relaxed text-bone-dim">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-bone-dim transition-colors hover:bg-bone/5 hover:text-bone"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">{children}</div>

        {footer ? (
          <div className="border-t border-line px-5 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
