import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navigation } from "@/components/Navigation";

import { Theme } from "@/context/Theme";
import { AuthProvider } from "@/context/Auth";

import "./globals.css";
import { PostHog } from "@/context/PostHog";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col overflow-hidden h-[100vh]`}
      >
        {/* <CookiesProvider> */}
        <AuthProvider>
          <PostHog>
            <Theme>
              <Navigation />
              <div className="flex flex-col flex-1 overflow-hidden">
                {children}
              </div>
            </Theme>
          </PostHog>
        </AuthProvider>
        {/* </CookiesProvider> */}
      </body>
    </html>
  );
}
