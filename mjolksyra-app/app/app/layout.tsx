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

        {children}
      </div>
    </div>
  );
}
