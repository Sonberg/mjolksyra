"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHog } from "@/context/PostHog";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/Auth";
import { UserEventsProvider } from "@/context/UserEvents";

const client = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider waitlistUrl="/waitlist">
      <AuthProvider>
        <UserEventsProvider>
          <QueryClientProvider client={client}>
            <PostHog>{children}</PostHog>
          </QueryClientProvider>
        </UserEventsProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}
