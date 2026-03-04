import { cn } from "@/lib/utils";

export function shellRoleLinkClass(isActive: boolean) {
  return cn(
    "inline-flex items-center justify-center rounded-none px-3 py-1.5 text-xs font-semibold outline-none transition-colors duration-200 md:text-sm",
    isActive
      ? "bg-[var(--shell-ink)] text-[var(--shell-surface)]"
      : "bg-transparent text-[var(--shell-ink)] hover:bg-[var(--shell-surface-strong)]",
  );
}

export function shellSectionTabClass(isActive: boolean) {
  return cn(
    "inline-flex h-10 items-center justify-center rounded-none border-2 px-3.5 py-2 text-sm font-medium transition-colors",
    isActive
      ? "border-[var(--shell-border)] bg-[var(--shell-ink)] text-[var(--shell-surface)]"
      : "border-transparent bg-transparent text-[var(--shell-ink)] hover:border-[var(--shell-border)] hover:bg-[var(--shell-surface-strong)]",
  );
}
