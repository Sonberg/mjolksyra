"use client";

import { User } from "@/services/users/type";
import { Trainee } from "@/services/trainees/type";
import { CoachOnboarding } from "../CoachOnboarding";
import { CoachWorkspaceShell } from "../CoachWorkspaceShell";
import { CoachDashboardOverview } from "../CoachDashboardOverview";

type Props = {
  user: User;
  trainees: Trainee[];
};

export function DashboardPageContent({ user, trainees }: Props) {
  const onboardingComplete = user.onboarding.coach === "Completed";

  return onboardingComplete ? (
    <CoachWorkspaceShell>
      <CoachDashboardOverview trainees={trainees} />
    </CoachWorkspaceShell>
  ) : (
    <CoachWorkspaceShell showTabs={false}>
      <CoachOnboarding user={user} />
    </CoachWorkspaceShell>
  );
}
