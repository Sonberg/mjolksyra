import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserMe } from "@/services/users/getUserMe";

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

export default async function Layout({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  if (!pathname.startsWith("/app/onboard")) {
    const { getToken } = await auth();
    const accessToken = (await getToken()) ?? "";

    if (accessToken) {
      try {
        const user = await getUserMe({ accessToken });
        const coachDone = user.onboarding.coach === "Completed";
        const athleteDone = user.onboarding.athlete === "Completed";

        if (!coachDone || !athleteDone) {
          redirect("/app/onboard");
        }
      } catch {
        // non-critical — user may not exist in DB yet
      }
    }
  }

  return (
    <div className="theme-shell-two shell-two-canvas h-full min-h-0 overflow-y-auto text-[var(--shell-ink)]">
      <div className="w-full min-h-0">
        {children}
      </div>
    </div>
  );
}
