"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHog } from "@/context/PostHog";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/Auth";
import { UserEventsProvider } from "@/context/UserEvents";
import { ThemeProvider } from "@/context/Theme";

const client = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserEventsProvider>
            <QueryClientProvider client={client}>
              <PostHog>{children}</PostHog>
            </QueryClientProvider>
          </UserEventsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
