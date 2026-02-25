"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-white text-black"
                : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
