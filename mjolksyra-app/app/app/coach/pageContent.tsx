"use client";

import { User } from "@/services/users/type";
import { CoachOnboarding } from "./CoachOnboarding";
import { Trainee } from "@/services/trainees/type";
import { CoachDashboard } from "./CoachDashboard";

type Props = { trainees: Trainee[]; user: User };

export function PageContent({ trainees, user }: Props) {
  return (
    <div className="py-8 space-y-8">
      {user.onboarding.coach === "Completed" ? (
        <CoachDashboard trainees={trainees} />
      ) : (
        <CoachOnboarding user={user} />
      )}
    </div>
  );
}
