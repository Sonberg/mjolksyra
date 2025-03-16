"use client";

import { CoachCard } from "./CoachCard";
import { User } from "@/services/users/type";
import { CoachOnboarding } from "./CoachOnboarding";
import { Button } from "@/components/ui/button";
import { PlusIcon, UserPlusIcon } from "lucide-react";
import { TraineeResponse } from "@/generated-client";

type Props = { trainees: TraineeResponse[]; user: User };

export function PageContent({ trainees, user }: Props) {
  const canInvite = user.onboarding.coach === "Completed" || true;

  return (
    <div className="space-y-8">
      <CoachOnboarding user={user} />
      
      {/* Athletes Section */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Athletes</h2>
          <Button
            disabled={!canInvite}
            className="flex items-center gap-2 px-4 py-2 font-semibold"
            size="lg"
          >
            <UserPlusIcon className="w-5 h-5" />
            Invite Athlete
          </Button>
        </div>

        {trainees.length > 0 ? (
          <div className="grid gap-4">
            {trainees.map((trainee) => (
              <CoachCard key={trainee.id} trainee={trainee} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
              <UserPlusIcon className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Athletes Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {canInvite
                ? "Start growing your coaching business by inviting your first athlete."
                : "Complete your onboarding to start inviting athletes and grow your coaching business."}
            </p>
            <Button
              disabled={!canInvite}
              size="lg"
              className="font-semibold"
            >
              <PlusIcon className="w-5 h-5" />
              Invite Your First Athlete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
