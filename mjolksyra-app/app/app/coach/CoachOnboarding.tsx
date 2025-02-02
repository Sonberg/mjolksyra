import { ApiClient } from "@/services/client";
import { User } from "@/services/users/type";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { ReactNode, useCallback, useState } from "react";

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

  const card = (
    title: string | null,
    text: string | null,
    button: ReactNode | null
  ) => {
    return (
      <div className="mb-16">
        {title ? <CardTitle children={title} /> : null}
        {text ? <div className="py-4" children={text} /> : null}
        {button ? <div className="mt-4">{button}</div> : null}
      </div>
    );
  };

  const primaryButtonText =
    user.onboarding.coach === "NotStarted" ? "Continue" : "Get started";
  const primaryButton =
    user.onboarding.coach === "Completed" ? (
      <Button children="Dashboard" onClick={dashboard} />
    ) : (
      <Button onClick={start} disabled={isLoading}>
        {isLoading ? <Spinner size={8} /> : null} {primaryButtonText}
      </Button>
    );

  switch (user.onboarding.coach) {
    case "Completed":
      return card("Payment dashboard", null, primaryButton);

    case "NotStarted":
    case "Started":
      return card(
        "Onboarding",
        "One last step before you can invite your first athlete. You need to setup payments in order to recive money",
        primaryButton
      );
  }
}
