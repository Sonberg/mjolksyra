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

export const metadata: Metadata = {
  title: "Mjölksyra",
  description: "Community driven coaching platform",
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
