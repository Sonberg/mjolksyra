"use client";

import { ReactNode } from "react";
import {
  redirect,
  usePathname,
  useSelectedLayoutSegment,
} from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { CustomTab } from "@/components/CustomTab";

export default function Layout({ children }: { children: ReactNode }) {
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
            <UserButton />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
