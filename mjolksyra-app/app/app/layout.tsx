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
    <div className="bg-black min-h-screen overflow-y-auto">
      <div className="mb-32 w-full py-8 md:py-10">
        {children}
      </div>
    </div>
  );
}
