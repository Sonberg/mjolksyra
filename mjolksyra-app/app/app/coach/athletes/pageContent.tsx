"use client";

import { User } from "@/services/users/type";
import { Trainee } from "@/services/trainees/type";
import { CoachOnboarding } from "../CoachOnboarding";
import { CoachWorkspaceShell } from "../CoachWorkspaceShell";
import { CoachAthletesContent } from "../CoachAthletesContent";

type Props = {
  user: User;
  trainees: Trainee[];
};

export function AthletesPageContent({ user, trainees }: Props) {
  const onboardingComplete = user.onboarding.coach === "Completed";

  return onboardingComplete ? (
    <CoachWorkspaceShell>
      <CoachAthletesContent trainees={trainees} />
    </CoachWorkspaceShell>
  ) : (
    <CoachWorkspaceShell showTabs={false}>
      <CoachOnboarding user={user} />
    </CoachWorkspaceShell>
  );
}
