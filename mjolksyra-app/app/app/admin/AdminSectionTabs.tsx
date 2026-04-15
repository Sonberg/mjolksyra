"use client";
import { usePathname } from "next/navigation";
import { NavigationTabs } from "@/components/Navigation/NavigationTabs";

type AdminTab = "dashboard" | "users" | "feedback" | "discount" | "attachments";

function getActiveTab(pathname: string): AdminTab {
  if (pathname.startsWith("/app/admin/users")) return "users";
  if (pathname.startsWith("/app/admin/discount")) return "discount";
  if (pathname.startsWith("/app/admin/feedback")) return "feedback";
  if (pathname.startsWith("/app/admin/attachments")) return "attachments";
  return "dashboard";
}

export function AdminSectionTabs() {
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  const tabs: Array<{ key: AdminTab; href: string; label: string }> = [
    { key: "dashboard", href: "/app/admin", label: "Dashboard" },
    { key: "users", href: "/app/admin/users", label: "Users" },
    { key: "feedback", href: "/app/admin/feedback", label: "Feedback" },
    { key: "discount", href: "/app/admin/discount", label: "Discount" },
    { key: "attachments", href: "/app/admin/attachments", label: "Attachments" },
  ];

  return <NavigationTabs tabs={tabs} activeTab={activeTab} />;
}
