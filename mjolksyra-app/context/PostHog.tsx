"use client";

import posthog from "posthog-js";

import { PostHogProvider } from "posthog-js/react";
import { ReactNode, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

type Props = {
  children: ReactNode;
};

export function PostHog({ children }: Props) {
  const { user } = useUser();

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

    if (user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      });
    }
  }, [user]);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
