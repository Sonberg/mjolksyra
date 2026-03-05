"use client";
import { usePathname } from "next/navigation";
import { NavigationTabs } from "@/components/Navigation/NavigationTabs";

type AdminTab = "dashboard" | "feedback";

function getActiveTab(pathname: string): AdminTab {
  if (pathname.startsWith("/app/admin/feedback")) return "feedback";
  return "dashboard";
}

export function AdminSectionTabs() {
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  const tabs: Array<{ key: AdminTab; href: string; label: string }> = [
    { key: "dashboard", href: "/app/admin", label: "Dashboard" },
    { key: "feedback", href: "/app/admin/feedback", label: "Feedback" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <NavigationTabs
        tabs={tabs}
        activeTab={activeTab}
        tabClassName="min-w-[8.5rem]"
      />
    </div>
  );
}
