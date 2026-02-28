"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <div className="flex flex-wrap items-center gap-1.5">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                : "border border-transparent text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
