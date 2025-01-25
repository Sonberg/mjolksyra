"use client";

import { User } from "@/api/users/type";
import { AthleteOnboarding } from "./AthleteOnboarding";
import { AthleteWorkouts } from "./AthleteWorkouts";

type Props = {
  user: User;
};

export function PageContent({ user }: Props) {
  return user.onboarding.athlete === "Completed" ? (
    <AthleteWorkouts />
  ) : (
    <AthleteOnboarding user={user} />
  );
}
