"use client";

import { PropsWithChildren } from "react";
import { CoachSectionTabs } from "./CoachSectionTabs";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/app/components/PageLayout";

type Props = PropsWithChildren<{
  className?: string;
  showTabs?: boolean;
  fullBleed?: boolean;
}>;

export function CoachWorkspaceShell({
  children,
  className,
  showTabs = true,
  fullBleed = false,
}: Props) {
  return (
    <PageLayout
      fullBleed={fullBleed}
      navigation={showTabs ? { tabs: <CoachSectionTabs /> } : undefined}
    >
      {children}
    </PageLayout>
  );
}
