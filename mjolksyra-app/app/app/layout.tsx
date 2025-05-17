"use client";

import { ReactNode } from "react";
import {
  redirect,
  usePathname,
  useSelectedLayoutSegment,
} from "next/navigation";
import { useAuth } from "@/context/Auth";
import { LogOutIcon } from "lucide-react";
import { CustomTab } from "@/components/CustomTab";

export default function Layout({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const segment = useSelectedLayoutSegment() ?? "";
  const pathname = usePathname();
  const showLayout = pathname.endsWith(segment);

  if (!showLayout) {
    return children;
  }

  return (
    <div className=" bg-black min-h-screen overflow-y-auto">
      <div className="mt-12 px-6 mx-auto w-full container mb-32">
        <div className="flex justify-between items-center">
          <div />
          <div className="flex gap-4 items-center">
            <CustomTab
              value={segment}
              options={[
                { name: "Coach", value: "coach" },
                { name: "Athlete", value: "athlete" },
              ]}
              onSelect={(tab) => redirect(`/app/${tab.value}`)}
            />
            <div
              className="bg-white/5 hover:bg-white/10 rounded-lg h-8 w-8 cursor-pointer grid place-items-center transition-colors"
              onClick={auth.logout}
            >
              <LogOutIcon className="h-4 text-stone-200" />
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
