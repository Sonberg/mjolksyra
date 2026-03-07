import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="theme-shell-two shell-two-canvas h-full min-h-0 overflow-y-auto text-[var(--shell-ink)]">
      <div className="w-full min-h-0">
        {children}
      </div>
    </div>
  );
}
