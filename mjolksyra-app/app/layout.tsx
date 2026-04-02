import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Navigation } from "@/components/Navigation";
import { getUserMe } from "@/services/users/getUserMe";

import "./globals.css";
import { Providers } from "./providers";

const interFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mjolksyra | Coaching Platform for Athletes and Coaches",
    template: "%s | Mjolksyra",
  },
  description:
    "Mjolksyra helps coaches manage athletes, build training blocks, and deliver structured programming.",
  applicationName: "Mjolksyra",
  keywords: [
    "coaching platform",
    "athlete coaching",
    "training blocks",
    "workout planner",
    "strength coach software",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Mjolksyra",
    title: "Mjolksyra | Coaching Platform for Athletes and Coaches",
    description:
      "Manage athletes, build training blocks, and deliver structured coaching in one workspace.",
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
    title: "Mjolksyra | Coaching Platform for Athletes and Coaches",
    description:
      "Manage athletes, build training blocks, and deliver structured coaching in one workspace.",
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
  if (userId) {
    try {
      const accessToken = (await getToken()) ?? "";
      if (accessToken) {
        const me = await getUserMe({ accessToken });
        isAdmin = me.isAdmin;
      }
    } catch {
      // non-critical — user may not exist in DB yet
    }
  }

  const initialAuth = {
    isAuthenticated: Boolean(userId),
    name: user?.fullName ?? null,
    email: user?.emailAddresses.at(0)?.emailAddress ?? null,
    givenName: user?.firstName ?? null,
    familyName: user?.lastName ?? null,
    isAdmin,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem('mjolksyra-theme');var d=document.documentElement;var dark=s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark){d.classList.add('dark');d.dataset.theme='dark';}else{d.dataset.theme='light';}}catch(e){}})()` }} />
      </head>
      <body
        className={`${interFont.variable} antialiased flex h-[100dvh] flex-col overflow-hidden`}
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
