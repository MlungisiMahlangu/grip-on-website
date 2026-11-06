import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "light" | "outlineLight";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-[#ff7f2a]",
  secondary: "border border-line-strong text-bone hover:border-bone hover:bg-bone hover:text-ink",
  ghost: "text-bone hover:text-accent",
  light: "bg-ink text-bone hover:bg-ink-soft",
  outlineLight: "border border-ink/25 text-ink hover:bg-ink hover:text-light",
};

export function buttonClasses(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-card)] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
    variants[variant],
    className,
  );
}
