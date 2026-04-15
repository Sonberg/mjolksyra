import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "solid" | "accent" | "subtle";

const variantClasses: Record<Variant, string> = {
  default:
    "border border-[var(--shell-border)] bg-transparent text-[var(--shell-muted)]",
  solid:
    "border border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)]",
  accent:
    "border border-transparent bg-[var(--shell-accent)] text-[var(--shell-accent-ink)]",
  subtle:
    "border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-muted)]",
};

type Props = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

export function StatusBadge({ variant = "default", children, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-none px-2 text-[10px] font-semibold uppercase tracking-[0.1em]",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
