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
      <div className="min-w-0">
        {(eyebrow || leading) ? (
          <div className="flex items-center gap-2">
            {leading ? <div className="shrink-0">{leading}</div> : null}
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
                {eyebrow}
              </p>
            ) : null}
          </div>
        ) : null}
        <h1
          className={cn(
            "text-2xl font-semibold tracking-tight text-[var(--shell-ink)] md:text-3xl",
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
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
