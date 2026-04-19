"use client";

import { cn } from "@/lib/utils";
import { Loader2Icon, PlayIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = {
  src?: string;
  alt: string;
  isVideo?: boolean;
  isPending?: boolean;
  onClick?: () => void;
  buttonProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type">;
  actionButton?: ReactNode;
  className?: string;
  size?: "default" | "small" | "xsmall";
};

export function WorkoutMediaThumbnail({
  src,
  alt,
  isVideo = false,
  isPending = false,
  onClick,
  buttonProps,
  actionButton,
  className,
  size = "default",
}: Props) {
  const isInteractive = !!onClick || !!buttonProps;

  const content = (
    <>
      {isVideo ? (
        src && !isPending ? (
          <video
            src={src}
            preload="metadata"
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[var(--shell-surface)]" />
        )
      ) : src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "h-full w-full object-cover",
            isPending ? "opacity-60" : "",
            isInteractive ? "transition group-hover:opacity-90" : "",
          )}
        />
      ) : (
        <div className="h-full w-full bg-[var(--shell-surface)]" />
      )}

      {isVideo && !isPending ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--shell-ink)]/35 transition group-hover:bg-[var(--shell-ink)]/45">
          <div className="flex size-9 items-center justify-center rounded-full bg-[var(--shell-ink)] text-[var(--shell-surface)]">
            <PlayIcon className="size-4 translate-x-px" />
          </div>
        </div>
      ) : null}

      {isPending ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--shell-surface)]/30">
          <Loader2Icon className="size-5 animate-spin text-[var(--shell-ink)]" />
        </div>
      ) : null}

      {actionButton}
    </>
  );

  const baseClassName = cn(
    size === "xsmall"
      ? "group relative size-12 overflow-hidden sm:size-14"
      : size === "small"
        ? "group relative size-16 overflow-hidden sm:size-20"
        : "group relative size-24 overflow-hidden sm:size-32",
    isInteractive
      ? "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shell-accent)]"
      : "",
    className,
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={baseClassName}
        {...buttonProps}
      >
        {content}
      </button>
    );
  }

  return <div className={baseClassName}>{content}</div>;
}
