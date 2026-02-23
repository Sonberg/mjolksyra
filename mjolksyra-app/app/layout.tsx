import type { Metadata } from "next";
import localFont from "next/font/local";
import { Spectral, Unbounded } from "next/font/google";
import { Navigation } from "@/components/Navigation";

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

const displayFont = Unbounded({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const bodyFont = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
        url: "/images/logo-dark.png",
        width: 1200,
        height: 630,
        alt: "Mjolksyra",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mjolksyra | Coaching Platform for Athletes and Coaches",
    description:
      "Manage athletes, build training blocks, and deliver structured coaching in one workspace.",
    images: ["/images/logo-dark.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${displayFont.variable} ${bodyFont.variable} antialiased flex flex-col overflow-hidden dark bg-black h-[100vh]`}
      >
        <Providers>
          <Navigation />
          <main className="flex flex-col flex-1 overflow-hidden">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
