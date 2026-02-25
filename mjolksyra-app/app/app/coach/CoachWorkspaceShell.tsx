"use client";

import { PropsWithChildren, type CSSProperties } from "react";
import { CoachSectionTabs } from "./CoachSectionTabs";
import { cn } from "@/lib/utils";

type Props = PropsWithChildren<{
  className?: string;
  contentClassName?: string;
  showTabs?: boolean;
  style?: CSSProperties;
  fullBleed?: boolean;
}>;

export function CoachWorkspaceShell({
  children,
  className,
  contentClassName,
  showTabs = true,
  style,
  fullBleed = false,
}: Props) {
  return (
    <div
      style={style}
      className={cn(
        "font-[var(--font-body)] relative mx-auto w-full overflow-x-clip overflow-y-visible",
        showTabs && "-mt-8 md:-mt-10",
        fullBleed && "-mb-32",
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-8 -right-10 h-36 w-36 rotate-12 rounded-[1.25rem] border border-zinc-800 bg-white/[0.02]" />
      <div className="pointer-events-none absolute top-20 -left-6 h-24 w-24 -rotate-6 rounded-[1rem] border border-zinc-800 bg-white/[0.015]" />

      {showTabs ? (
        <div className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/85">
          <CoachSectionTabs />
        </div>
      ) : null}
      <div
        className={cn(
          "mx-auto w-full max-w-6xl space-y-8 pt-8 px-4 md:px-6",
          fullBleed && "max-w-none pt-0",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
