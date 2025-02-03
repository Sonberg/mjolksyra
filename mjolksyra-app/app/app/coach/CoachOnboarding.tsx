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
          button={<Button children="Dashboard" onClick={dashboard} />}
        />
      );

    case "NotStarted":
    case "Started":
      return (
        <OnboardingCard
          title="Coach onboarding"
          text="One last step before you can invite your first athlete. You need to setup payments in order to recive money"
          button={
            <Button onClick={start} disabled={isLoading}>
              {isLoading ? <Spinner size={8} /> : null}{" "}
              {user.onboarding.coach === "NotStarted"
                ? "Continue"
                : "Get started"}
            </Button>
          }
        />
      );
  }
}
