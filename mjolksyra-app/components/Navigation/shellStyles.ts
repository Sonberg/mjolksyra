import { cn } from "@/lib/utils";

export const shellSegmentedContainerClass =
  "inline-flex items-stretch border border-[var(--shell-border)] bg-[var(--shell-surface)] divide-x divide-[var(--shell-border)]";

export function shellRoleLinkClass(isActive: boolean) {
  return cn(
    "inline-flex items-center justify-center rounded-none px-5 py-2 text-xs font-semibold outline-none transition-colors duration-150 md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shell-accent)] focus-visible:ring-offset-1",
    isActive
      ? "bg-[var(--shell-ink)] text-[var(--shell-surface)]"
      : "bg-[var(--shell-surface)] text-[var(--shell-ink)] hover:bg-[var(--shell-surface-strong)]",
  );
}

export function shellSectionTabClass(isActive: boolean) {
  return cn(
    "inline-flex h-10 items-center justify-center rounded-none px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shell-accent)] focus-visible:ring-offset-1",
    isActive
      ? "bg-[var(--shell-ink)] text-[var(--shell-surface)]"
      : "bg-[var(--shell-surface)] text-[var(--shell-muted)] hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]",
  );
}
