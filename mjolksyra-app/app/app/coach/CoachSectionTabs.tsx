"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { shellSectionTabClass } from "@/components/Navigation/shellStyles";

type CoachTab = "dashboard" | "athletes" | "blocks";

function getActiveTab(pathname: string): CoachTab {
  if (pathname.startsWith("/app/coach/blocks")) return "blocks";
  if (pathname.startsWith("/app/coach/athletes")) return "athletes";
  if (pathname.startsWith("/app/coach/dashboard")) return "dashboard";

  return "dashboard";
}

export function CoachSectionTabs() {
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  const tabs: Array<{ key: CoachTab; href: string; label: string }> = [
    { key: "dashboard", href: "/app/coach/dashboard", label: "Dashboard" },
    { key: "athletes", href: "/app/coach/athletes", label: "Athletes" },
    { key: "blocks", href: "/app/coach/blocks", label: "Blocks" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
      <div className="flex flex-wrap items-center gap-1.5">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={shellSectionTabClass(isActive)}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
