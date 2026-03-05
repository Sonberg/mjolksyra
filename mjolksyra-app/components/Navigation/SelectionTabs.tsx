"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { shellRoleLinkClass, shellSegmentedContainerClass } from "./shellStyles";

type SelectionTabSize = "sm" | "md" | "lg";

const sizeClassBySize: Record<SelectionTabSize, string> = {
  sm: "h-9 px-3 py-0 text-sm",
  md: "h-9 px-4 py-0 text-base",
  lg: "h-12 px-5 py-0 text-lg",
};

export type SelectionTabItem<TKey extends string = string> = {
  key: TKey;
  label: string;
  href?: string;
  onSelect?: (item: SelectionTabItem<TKey>) => void;
};

type SelectionTabsProps<TKey extends string = string> = {
  items: SelectionTabItem<TKey>[];
  activeKey: TKey;
  size?: SelectionTabSize;
  className?: string;
  itemClassName?: string;
  fullWidth?: boolean;
};

export function SelectionTabs({
  items,
  activeKey,
  size = "md",
  className,
  itemClassName,
  fullWidth = false,
}: SelectionTabsProps) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(shellSegmentedContainerClass, className)}
      tabIndex={0}
      data-orientation="horizontal"
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const baseClass = cn(
          shellRoleLinkClass(isActive),
          sizeClassBySize[size],
          fullWidth && "flex-1 text-center",
          itemClassName,
        );

        if (item.href) {
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={baseClass}
            >
              {item.label}
            </Link>
          );
        }

        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => item.onSelect?.(item)}
            className={baseClass}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
