"use client";

import { Trainee } from "@/api/trainees/type";
import { CoachCard } from "./CoachCard";
import { User } from "@/api/users/type";
import { CoachOnboarding } from "./CoachOnboarding";

type Props = { trainees: Trainee[]; user: User };

export function PageContent({ trainees, user }: Props) {
  if (user.onboarding.coach !== "Completed") {
    return <CoachOnboarding />;
  }

  return (
    <div>
      {trainees.map((x) => (
        <CoachCard key={x.id} trainee={x} />
      ))}
    </div>
  );
}
