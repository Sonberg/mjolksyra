"use client";

import { ApiClient } from "@/services/client";
import { User } from "@/services/users/type";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { OnboardingCard } from "@/components/OnboardingCard";
import { useRouter } from "next/navigation";
import { useUserEvents } from "@/context/UserEvents";

type Account = { accountId: string };
type Link = { url: string };
type Dashboard = { url: string };
type Props = {
  user: User;
};

export function CoachOnboarding({ user }: Props) {
  const userEvents = useUserEvents();
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onUserUpdated = () => {
      router.refresh();
    };
    const unsubscribe = userEvents.subscribe("user.updated", onUserUpdated);

    return () => {
      unsubscribe();
    };
  }, [router, userEvents]);

  const dashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await ApiClient.get<Dashboard>("/api/stripe/dashboard");
      window.open(data.url, "_blank");
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }, []);

  const start = useCallback(async () => {
    setLoading(true);
    try {
      const account = await ApiClient.post<Account>("/api/stripe/account");
      router.refresh();
      const link = await ApiClient.post<Link>("/api/stripe/account/link", {
        accountId: account.data.accountId,
        baseUrl: location.origin,
      });
      window.open(link.data.url, "_blank");
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }, [router]);

  switch (user.onboarding.coach) {
    case "Completed":
      return (
        <OnboardingCard
          title="Payment dashboard"
          text="Access your earnings and manage your payment settings"
          button={
            <Button
              onClick={dashboard}
              className="w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-ink)] font-semibold text-[var(--shell-surface)] hover:bg-[var(--shell-ink-soft)]"
            >
              {isLoading ? <Spinner size={8} /> : "Open dashboard"}
            </Button>
          }
        />
      );

    case "NotStarted":
    case "Started":
      return (
        <OnboardingCard
          title="Are you our new coach? Welcome!"
          text="Set up your payment details to start accepting athletes and receiving payments for your coaching services"
          button={
            <Button
              onClick={start}
              disabled={isLoading}
              className="w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-accent)] font-semibold text-[var(--shell-accent-ink)] hover:bg-[#ce2f10]"
            >
              {isLoading ? (
                <Spinner size={8} />
              ) : user.onboarding.coach === "NotStarted" ? (
                "Get started"
              ) : (
                "Continue setup"
              )}
            </Button>
          }
        />
      );
  }
}
