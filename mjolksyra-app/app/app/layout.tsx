"use client";

import { ReactNode } from "react";
import {
  usePathname,
  useRouter,
  useSelectedLayoutSegment,
} from "next/navigation";
import { useAuth } from "@/context/Auth";
import { LogOutIcon } from "lucide-react";
import { CustomTab } from "@/components/CustomTab";

export default function Layout({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const segment = useSelectedLayoutSegment() ?? "";
  const pathname = usePathname();
  const showLayout = pathname.endsWith(segment);

  if (!showLayout) {
    return children;
  }

  return (
    <div className="bg-black min-h-screen overflow-y-auto">
      <div className="mt-12 px-6 mx-auto w-full container mb-32">
        <div className="flex justify-between items-center rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3">
          <div className="font-[var(--font-display)] text-sm uppercase tracking-[0.14em] text-zinc-400">
            Workspace
          </div>
          <div className="flex gap-4 items-center">
            <CustomTab
              value={segment}
              options={[
                { name: "Coach", value: "coach" },
                { name: "Athlete", value: "athlete" },
              ]}
              onSelect={(tab) => router.push(`/app/${tab.value}`)}
            />
            <div
              className="bg-white/5 hover:bg-white/10 rounded-lg h-8 w-8 cursor-pointer grid place-items-center transition-colors border border-zinc-700"
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
