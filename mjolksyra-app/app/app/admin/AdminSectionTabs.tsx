"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  shellSectionTabClass,
  shellSegmentedContainerClass,
} from "@/components/Navigation/shellStyles";

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
    <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
      <div className={shellSegmentedContainerClass}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`${shellSectionTabClass(isActive)} min-w-[8.5rem]`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
