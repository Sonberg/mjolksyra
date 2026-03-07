import type { Metadata } from "next";
import localFont from "next/font/local";
import { Alfa_Slab_One, DM_Sans } from "next/font/google";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Navigation } from "@/components/Navigation";
import { getUserMe } from "@/services/users/getUserMe";

import "./globals.css";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const displayFont = Alfa_Slab_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
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
        className={`${geistSans.variable} ${geistMono.variable} ${displayFont.variable} ${bodyFont.variable} antialiased flex h-[100vh] flex-col overflow-hidden`}
      >
        <Providers>
          <Navigation initialAuth={initialAuth} />
          <main className="flex flex-col flex-1 overflow-hidden">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
