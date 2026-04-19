import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  text?: string;
  button?: ReactNode;
  className?: string;
  variant?: "default" | "purple";
};

export function OnboardingCard({
  text,
  title,
  button,
  className,
  variant = "default",
}: Props) {
  const baseStyles =
    "relative overflow-hidden rounded-none border border-[var(--shell-border)] p-8 transition-colors";
  const hoverEffect = "hover:bg-[var(--shell-surface-strong)]";

  const backgroundStyles = cn({
    "bg-[var(--shell-surface)]": variant === "default",
    "bg-[var(--shell-surface-strong)]": variant === "purple",
  });

  const titleStyles =
    "mb-4 font-[var(--font-display)] text-2xl tracking-tight text-[var(--shell-ink)]";

  return (
    <div
      className={cn(
        baseStyles,
        backgroundStyles,
        hoverEffect,
        className
      )}
    >
      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4">
        {title && <h3 className={titleStyles}>{title}</h3>}
        {text && (
          <p className="text-base leading-relaxed text-[var(--shell-muted)]">
            {text}
          </p>
        )}
        {button && (
          <div className="mt-2 flex justify-start">
            <div className="inline-flex">{button}</div>
          </div>
        )}
      </div>

    </div>
  );
}
