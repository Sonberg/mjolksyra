"use client";

import { usePathname } from "next/navigation";
import { NavigationTabs } from "@/components/Navigation/NavigationTabs";

type CoachTab = "dashboard" | "athletes" | "blocks" | "payments" | "credits";

function getActiveTab(pathname: string): CoachTab {
  if (pathname.startsWith("/app/coach/blocks")) return "blocks";
  if (pathname.startsWith("/app/coach/athletes")) return "athletes";
  if (pathname.startsWith("/app/coach/credits")) return "credits";
  if (pathname.startsWith("/app/coach/payments")) return "payments";
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
    { key: "payments", href: "/app/coach/payments", label: "Payments" },
    { key: "credits", href: "/app/coach/credits", label: "Credits" },
  ];

  return <NavigationTabs tabs={tabs} activeTab={activeTab} />;
}
