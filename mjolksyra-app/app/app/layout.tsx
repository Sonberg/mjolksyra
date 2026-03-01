import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-black h-full min-h-0 overflow-y-auto">
      <div className="w-full min-h-0">
        {children}
      </div>
    </div>
  );
}
