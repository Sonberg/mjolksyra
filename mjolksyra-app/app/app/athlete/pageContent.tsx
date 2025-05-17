"use client";

import { User, UserTrainee } from "@/services/users/type";
import { AthleteOnboardingFlow } from "@/components/AthleteOnboardingFlow/AthleteOnboardingFlow";
import { AthleteWorkouts } from "./AthleteWorkouts";
import { AthleteInvitations } from "./AthleteInvitations";
import {
  DumbbellIcon,
  UserCircle2Icon,
  CalendarIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Trainee } from "@/services/trainees/type";
import { useState } from "react";
import { AthleteCoach } from "./AthleteCoach";
import { AthleteDashboard } from "./AthleteDashboard";

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
              <section className="rounded-xl border border-gray-800/50 bg-gray-950/50 p-6 backdrop-blur-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-100">
                    Your Coaches
                  </h2>
                </div>

                {user.coaches?.length > 0 && (
                  <div className="space-y-4 mb-8">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">
                      Active
                    </h3>
                    {user.coaches.map((x) => (
                      <AthleteCoach
                        key={x.traineeId}
                        coach={x}
                        isSelected={x.traineeId === coach?.traineeId}
                        onSelect={() => setCoach(x)}
                      />
                    ))}
                  </div>
                )}

                {user.invitations.length ? (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Pending Invitations
                    </h3>
                    <AthleteInvitations invitations={user.invitations} />
                  </div>
                ) : null}
              </section>
            </div>
            {coach ? <AthleteDashboard coach={coach} /> : null}
          </div>
        </>
      )}
    </div>
  );
}
