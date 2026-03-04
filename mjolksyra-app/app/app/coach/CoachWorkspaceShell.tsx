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
        showTabs && !fullBleed && "-mt-8 md:-mt-10",
        className,
      )}
    >
      {showTabs ? (
        <div className="sticky top-0 z-40 border-b-2 border-[var(--shell-border)] bg-[color-mix(in_srgb,var(--shell-surface),transparent_10%)] px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--shell-surface),transparent_6%)]">
          <CoachSectionTabs />
        </div>
      ) : null}
      <div
        className={cn(
          "mx-auto w-full max-w-6xl space-y-8 pt-16",
          fullBleed && "max-w-none pt-0",
          !fullBleed && "px-4 md:px-6",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
