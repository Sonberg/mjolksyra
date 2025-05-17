"use client";

import { User, UserTrainee } from "@/services/users/type";
import { AthleteOnboardingFlow } from "@/components/AthleteOnboardingFlow/AthleteOnboardingFlow";
import { useState } from "react";
import { AthleteDashboard } from "./AthleteDashboard";
import { AthleteCoaches } from "./AthleteCoaches";

type Props = {
  user: User;
};

export function PageContent({ user }: Props) {
  const [coach, setCoach] = useState<UserTrainee | null>(user.coaches[0]);
  const needsOnboarding = user.onboarding.athlete !== "Completed" || false;

  return (
    <div className="py-8 space-y-8">
      {false ? (
        <AthleteOnboardingFlow />
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
              Welcome Back, {user.givenName || "Athlete"}
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Track your progress and manage your workouts
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <AthleteCoaches
                user={user}
                selected={coach}
                onSelect={setCoach}
              />
            </div>
            {coach ? <AthleteDashboard coach={coach} /> : null}
          </div>
        </>
      )}
    </div>
  );
}
