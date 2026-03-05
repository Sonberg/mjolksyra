import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuth } from "@/context/Auth";
import { getUserMe } from "@/services/users/getUserMe";
import { AdminSectionTabs } from "./AdminSectionTabs";
import { PageLayout } from "@/app/components/PageLayout";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const auth = await getAuth({ redirect: true });
  const me = await getUserMe({ accessToken: auth!.accessToken });

  if (!me.isAdmin) {
    redirect("/app");
  }

  return (
    <PageLayout navigation={{ tabs: <AdminSectionTabs /> }}>
      {children}
    </PageLayout>
  );
}
