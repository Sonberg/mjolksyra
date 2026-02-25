"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHog } from "@/context/PostHog";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/Auth";

const client = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider waitlistUrl="/waitlist">
      <AuthProvider>
        <QueryClientProvider client={client}>
          <PostHog>{children}</PostHog>
        </QueryClientProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}
