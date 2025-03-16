"use client";

import { User } from "@/services/users/type";
import { CoachOnboarding } from "./CoachOnboarding";
import { Button } from "@/components/ui/button";
import { PlusIcon, UserPlusIcon } from "lucide-react";
import { Trainee } from "@/services/trainees/type";
import { TraineeCard } from "./TraineeCard";
import { useRouter } from "next/navigation";

type Props = { trainees: Trainee[]; user: User };

export function PageContent({ trainees, user }: Props) {
  const router = useRouter();
  const canInvite = user.onboarding.coach === "Completed";

  const handlePlanWorkout = (trainee: Trainee) => {
    router.push(`/app/coach/athletes/${trainee.id}/plan`);
  };

  const handleManageCost = (trainee: Trainee) => {
    router.push(`/app/coach/athletes/${trainee.id}/cost`);
  };

  const handleCancel = (trainee: Trainee) => {
    // TODO: Implement cancel functionality
    console.log("Cancel trainee:", trainee.id);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="py-8 space-y-8">
        <CoachOnboarding user={user} />

        {/* Athletes Section */}
        <div className="rounded-xl border border-gray-800/50 bg-gray-950/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
                Athletes
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                Manage your {trainees.length} {trainees.length === 1 ? "athlete" : "athletes"}
              </p>
            </div>
            <Button
              disabled={!canInvite}
              className="flex items-center gap-2 px-6 py-2 font-semibold shadow-sm bg-white/10 hover:bg-white/20 text-white"
              size="lg"
            >
              <UserPlusIcon className="w-5 h-5" />
              Invite Athlete
            </Button>
          </div>

          {trainees.length > 0 ? (
            <div className="grid gap-4">
              {trainees.map((trainee) => (
                <TraineeCard 
                  key={trainee.id} 
                  trainee={trainee}
                  onPlanWorkout={handlePlanWorkout}
                  onManageCost={handleManageCost}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-gray-800/50 bg-gray-950/80">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-stone-500/10 mb-6">
                <UserPlusIcon className="w-10 h-10 text-stone-200" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">
                No Athletes Yet
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {canInvite
                  ? "Ready to expand your coaching impact? Start by inviting your first athlete and begin your journey as a professional coach."
                  : "Complete your onboarding to unlock athlete invitations and start your coaching journey."}
              </p>
              <Button 
                disabled={!canInvite} 
                size="lg" 
                className="font-semibold px-8 bg-white/10 hover:bg-white/20 text-white"
              >
                <PlusIcon className="w-5 h-5" />
                Invite Your First Athlete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
