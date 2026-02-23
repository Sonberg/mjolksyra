"use client";

import { PropsWithChildren, type CSSProperties } from "react";
import { CoachSectionTabs } from "./CoachSectionTabs";
import { cn } from "@/lib/utils";

type Props = PropsWithChildren<{
  className?: string;
  showTabs?: boolean;
  style?: CSSProperties;
}>;

export function CoachWorkspaceShell({
  children,
  className,
  showTabs = true,
  style,
}: Props) {
  return (
    <div
      style={style}
      className={cn(
        "font-[var(--font-body)] relative mx-auto w-full space-y-8 overflow-hidden",
        className,
        "container mx-auto w-full space-y-8 overflow-hidden",
      )}
    >
      <div className="pointer-events-none absolute -top-8 -right-10 h-36 w-36 rotate-12 rounded-[1.25rem] border border-zinc-800 bg-white/[0.02]" />
      <div className="pointer-events-none absolute top-20 -left-6 h-24 w-24 -rotate-6 rounded-[1rem] border border-zinc-800 bg-white/[0.015]" />

      {showTabs ? <CoachSectionTabs /> : null}
      <div className="mx-auto w-full space-y-8">{children}</div>
    </div>
  );
}
