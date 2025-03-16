"use client";

import { AuthProvider } from "@/context/Auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHog } from "@/context/PostHog";
import { ReactNode } from "react";

const client = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={client}>
     
        <AuthProvider>
          <PostHog>{children}</PostHog>
        </AuthProvider>
    </QueryClientProvider>
  );
}
