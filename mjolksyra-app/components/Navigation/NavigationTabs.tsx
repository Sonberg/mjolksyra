"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  shellSectionTabClass,
  shellSegmentedContainerClass,
} from "./shellStyles";

export type NavigationTab<TKey extends string = string> = {
  key: TKey;
  href: string;
  label: string;
};

type NavigationTabsProps<TKey extends string = string> = {
  tabs: NavigationTab<TKey>[];
  activeTab: TKey;
  fullWidth?: boolean;
  segmented?: boolean;
  className?: string;
  tabClassName?: string;
};

export function NavigationTabs<TKey extends string = string>({
  tabs,
  activeTab,
  fullWidth = false,
  segmented = false,
  className,
  tabClassName,
}: NavigationTabsProps<TKey>) {
  return (
    <nav
      className={cn(
        segmented
          ? cn("flex w-full", shellSegmentedContainerClass)
          : "flex flex-wrap items-center gap-1.5",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              shellSectionTabClass(isActive),
              fullWidth && "flex-1 text-center",
              tabClassName,
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

