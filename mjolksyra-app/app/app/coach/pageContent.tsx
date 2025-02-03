"use client";

import { Trainee } from "@/services/trainees/type";
import { CoachCard } from "./CoachCard";
import { User } from "@/services/users/type";
import { CoachOnboarding } from "./CoachOnboarding";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

type Props = { trainees: Trainee[]; user: User };

export function PageContent({ trainees, user }: Props) {
  return (
    <div>
      <CoachOnboarding user={user} />
      {trainees.length ? (
        <>
          <div className="mb-4 text-2xl font-bold">Athletes</div>
          <div className="mb-8">
            {trainees.map((x) => (
              <CoachCard key={x.id} trainee={x} />
            ))}
          </div>
        </>
      ) : null}
      {user.onboarding.coach === "Completed" ? (
        <div className="grid place-items-center">
          <Button className="mx-auto text-center rounded-full px-8 py-6 text-base font-semibold">
            <PlusIcon /> Invite athlete
          </Button>
        </div>
      ) : null}
    </div>
  );
}
