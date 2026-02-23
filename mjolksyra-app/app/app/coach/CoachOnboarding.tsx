import { ApiClient } from "@/services/client";
import { User } from "@/services/users/type";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { OnboardingCard } from "@/components/OnboardingCard";
import { useRouter } from "next/navigation";

type Account = { accountId: string };
type Link = { url: string };
type Dashboard = { url: string };
type AccountSync = { hasAccount: boolean; completed: boolean };
type Props = {
  user: User;
};

export function CoachOnboarding({ user }: Props) {
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const isStarted = user.onboarding.coach === "Started";

  const syncCoachStatus = useCallback(async () => {
    if (!isStarted) return;

    try {
      const { data } = await ApiClient.post<AccountSync>("/api/stripe/account/sync");
      if (data.completed) {
        router.refresh();
      }
    } catch (error) {
      console.log(error);
    }
  }, [isStarted, router]);

  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "visible") {
        void syncCoachStatus();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [syncCoachStatus]);

  useEffect(() => {
    if (!isStarted) return;

    void syncCoachStatus();
    const timer = window.setInterval(() => {
      void syncCoachStatus();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isStarted, syncCoachStatus]);

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
              className="w-full font-semibold bg-white/10 hover:bg-white/20 text-white"
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
              className="w-full font-semibold bg-white hover:bg-white/80 text-black"
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
