"use client";

import { User } from "@/api/users/type";
import { AthleteOnboarding } from "./AthleteOnboarding";
import { AthleteWorkouts } from "./AthleteWorkouts";
import { AthleteInvitations } from "./AthleteInvitations";

type Props = {
  user: User;
};

export function PageContent({ user }: Props) {
  return (
    <>
      <AthleteOnboarding user={user} />
      <AthleteInvitations />
      <AthleteWorkouts />
    </>
  );
}
