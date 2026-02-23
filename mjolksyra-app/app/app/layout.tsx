"use client";

import { ReactNode } from "react";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";

export default function Layout({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment() ?? "";
  const pathname = usePathname();
  const showLayout = pathname.endsWith(segment);

  if (!showLayout) {
    return children;
  }

  return (
    <div className="bg-black min-h-screen overflow-y-auto">
      <div className="mx-auto mb-32 w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {children}
      </div>
    </div>
  );
}
