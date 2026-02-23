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
      <div className="mx-auto mb-32 w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {children}
      </div>
    </div>
  );
}
