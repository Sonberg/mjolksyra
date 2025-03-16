import { User } from "@/services/users/type";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { AtheletePaymentDialog } from "@/dialogs/AtheletePaymentDialog";
import { useState } from "react";
import { OnboardingCard } from "@/components/OnboardingCard";

type Props = {
  user: User;
};

export function AthleteOnboarding({ user }: Props) {
  const [isLoading, setLoading] = useState(false);

  switch (user.onboarding.athlete) {
    case "Completed":
      return null;

    case "NotStarted":
    case "Started":
      return (
        <OnboardingCard
          title="Athlete onboarding"
          text="Almost there, you only need to add payment method."
          button={<AtheletePaymentDialog onBack={() => {}} />}
        />
      );
  }
}
