import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PageSectionHeaderProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
};

export function PageSectionHeader({
  title,
  eyebrow,
  description,
  leading,
  actions,
  className,
  titleClassName,
}: PageSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-5">
        {leading ? <div className="shrink-0">{leading}</div> : null}
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={cn(
              "text-2xl tracking-tight text-[var(--shell-ink)] md:text-3xl",
              titleClassName,
            )}
          >
            {title}
          </h1>
          {description ? (
            <div className="mt-1 text-sm text-[var(--shell-muted)]">
              {description}
            </div>
          ) : null}
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
