"use client";

import { User } from "@/services/users/type";
import { AthleteOnboardingFlow } from "@/components/AthleteOnboardingFlow/AthleteOnboardingFlow";
import { AthleteWorkouts } from "./AthleteWorkouts";
import { AthleteInvitations } from "./AthleteInvitations";

type Props = {
  user: User;
};

export function PageContent({ user }: Props) {
  const needsOnboarding = user.onboarding.athlete !== "Completed";

  return (
    <div className="container mx-auto px-4 py-8">
      {needsOnboarding ? (
        <AthleteOnboardingFlow />
      ) : (
        <>
          <AthleteInvitations />
          <AthleteWorkouts />
        </>
      )}
    </div>
  );
}
