import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuth } from "@/context/Auth";
import { getUserMe } from "@/services/users/getUserMe";
import { AdminSectionTabs } from "./AdminSectionTabs";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const auth = await getAuth({ redirect: true });
  const me = await getUserMe({ accessToken: auth!.accessToken });

  if (!me.isAdmin) {
    redirect("/app");
  }

  return (
    <>
      <div className="sticky top-0 z-40 border-b-2 border-[var(--shell-border)] bg-[color-mix(in_srgb,var(--shell-surface),transparent_6%)] px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--shell-surface),transparent_3%)]">
        <AdminSectionTabs />
      </div>
      {children}
    </>
  );
}
