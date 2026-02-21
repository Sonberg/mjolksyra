"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHog } from "@/context/PostHog";
import { ReactNode } from "react";

const client = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <QueryClientProvider client={client}>
        <PostHog>{children}</PostHog>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
