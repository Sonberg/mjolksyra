import { ApiClient } from "@/services/client";
import { User } from "@/services/users/type";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { OnboardingCard } from "@/components/OnboardingCard";

type Account = { accountId: string };
type Link = { url: string };
type Dashboard = { url: string };
type Props = {
  user: User;
};

export function CoachOnboarding({ user }: Props) {
  const [isLoading, setLoading] = useState(false);

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
      const link = await ApiClient.post<Link>("/api/stripe/account/link", {
        accountId: account.data.accountId,
        baseUrl: location.origin,
      });
      window.open(link.data.url, "_blank");
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }, []);

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
