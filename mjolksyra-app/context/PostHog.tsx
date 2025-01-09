"use client";

import posthog from "posthog-js";

import { PostHogProvider } from "posthog-js/react";
import { ReactNode, useEffect } from "react";
import { useAuth } from "./Auth";

type Props = {
  children: ReactNode;
};

export function PostHog({ children }: Props) {
  const auth = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!host || !key) {
      return;
    }

    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
    });

    if (auth.userId) {
      posthog.identify(auth.userId, {
        email: auth.email,
        name: auth.name,
      });
    }
  }, [auth]);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
