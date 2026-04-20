import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "adaptive.ai",
  robots: { index: false, follow: false },
};

export default function AdaptiveLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#0a0a0a] font-[Geist,system-ui,sans-serif]">
      {children}
    </div>
  );
}
