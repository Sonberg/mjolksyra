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
      <div className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/85">
        <AdminSectionTabs />
      </div>
      {children}
    </>
  );
}
