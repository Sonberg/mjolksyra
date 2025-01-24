import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/context/Auth";

import "./globals.css";
import { PostHog } from "@/context/PostHog";
import { CookiesProvider } from "next-client-cookies/server";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col overflow-hidden dark  h-[100vh]`}
      >
        <CookiesProvider>
          <AuthProvider>
            <PostHog>
              <Navigation />
              <main className="flex flex-col flex-1 overflow-hidden">
                {children}
              </main>
            </PostHog>
          </AuthProvider>
        </CookiesProvider>
      </body>
    </html>
  );
}
