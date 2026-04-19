import type { Metadata } from "next";
import localFont from "next/font/local";
import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { Navigation } from "@/components/Navigation";
import { getUserMe } from "@/services/users/getUserMe";

import "./globals.css";
import { Providers } from "./providers";

const geistFont = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

const geistMonoFont = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mjolksyra.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mjolksyra | AI Coaching Software for Strength Coaches",
    template: "%s | Mjolksyra",
  },
  description:
    "Mjolksyra is AI coaching software for strength coaches. Plan workouts, manage athletes, review training video, and deliver feedback in one platform.",
  applicationName: "Mjolksyra",
  keywords: [
    "ai coaching software",
    "strength coach software",
    "online strength coaching platform",
    "ai workout planner",
    "workout video analysis",
    "powerlifting coach software",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Mjolksyra",
    title: "Mjolksyra | AI Coaching Software for Strength Coaches",
    description:
      "Plan workouts, manage athletes, and use AI to stage programs and review check-in video in one coaching workspace.",
    images: [
      {
        url: "/images/og/mjolksyra-og.svg",
        width: 1200,
        height: 630,
        alt: "Mjolksyra coaching platform overview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mjolksyra | AI Coaching Software for Strength Coaches",
    description:
      "Plan workouts, manage athletes, and use AI to stage programs and review check-in video in one coaching workspace.",
    images: ["/images/og/mjolksyra-og.svg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId, getToken } = await auth();
  const user = userId ? await currentUser() : null;

  let isAdmin = false;
  const completedRoles: ("coach" | "athlete")[] = [];

  if (userId) {
    try {
      const accessToken = (await getToken()) ?? "";
      if (accessToken) {
        const me = await getUserMe({ accessToken });
        isAdmin = me.isAdmin;
        if (me.onboarding.coach === "Completed") completedRoles.push("coach");
        if (me.onboarding.athlete === "Completed") completedRoles.push("athlete");
      }
    } catch {
      // non-critical — user may not exist in DB yet
    }
  }

  const cookieStore = await cookies();
  const cookieRole = cookieStore.get("mjolksyra-active-role")?.value as
    | "coach"
    | "athlete"
    | undefined;
  const activeRole: "coach" | "athlete" | null =
    cookieRole && completedRoles.includes(cookieRole)
      ? cookieRole
      : completedRoles[0] ?? null;
  const showOnboardingNav = Boolean(userId) && completedRoles.length === 0;

  const initialAuth = {
    isAuthenticated: Boolean(userId),
    name: user?.fullName ?? null,
    email: user?.emailAddresses.at(0)?.emailAddress ?? null,
    givenName: user?.firstName ?? null,
    familyName: user?.lastName ?? null,
    isAdmin,
    completedRoles,
    activeRole,
    showOnboardingNav,
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${geistFont.variable} ${geistMonoFont.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var d=document.documentElement;d.classList.add('dark');d.dataset.theme='dark';})()` }} />
      </head>
      <body
        className="antialiased flex h-[100dvh] flex-col overflow-hidden"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-none focus:border focus:border-[var(--shell-border)] focus:bg-[var(--shell-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--shell-accent-ink)]"
        >
          Skip to content
        </a>
        <Providers>
          <Navigation initialAuth={initialAuth} />
          <main id="main-content" className="flex flex-col flex-1 overflow-hidden">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
