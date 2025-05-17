"use client";

import { User } from "@/services/users/type";
import { CoachOnboarding } from "./CoachOnboarding";
import { Button } from "@/components/ui/button";
import { UserPlusIcon } from "lucide-react";
import { Trainee } from "@/services/trainees/type";
import { TraineeCard } from "./TraineeCard";
import { useRouter } from "next/navigation";
import { InviteTraineeDialog } from "@/dialogs/InviteTraineeDialog/InviteTraineeDialog";
import { useQuery } from "@tanstack/react-query";
import { getTraineeInvitations } from "@/services/traineeInvitations/getTraineeInvitations";
import { TraineeInvitationCard } from "./TraineeInvitationCard";

type Props = { trainees: Trainee[]; user: User };

export function PageContent({ trainees, user }: Props) {
  const router = useRouter();
  const invitaions = useQuery({
    queryKey: ["invitations"],
    queryFn: ({ signal }) => getTraineeInvitations({ signal, type: "coach" }),
    initialData: [],
  });

  // const canInvite = user.onboarding.coach === "Completed";

  const handlePlanWorkout = (trainee: Trainee) => {
    router.push(`/app/coach/${trainee.id}/planner`);
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
              Athletes
            </h2>
          </div>
          <InviteTraineeDialog
            onCompletion={async () => {
              await invitaions.refetch();
            }}
            trigger={
              <Button
                disabled={false}
                className="flex items-center gap-2 px-6 py-2 font-semibold shadow-sm bg-white/10 hover:bg-white/20 text-white"
                size="lg"
              >
                <UserPlusIcon className="w-5 h-5" />
                Invite Athlete
              </Button>
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-8">
          {trainees.length > 0
            ? trainees.map(
                (trainee) => (
                  <TraineeCard
                    key={trainee.id}
                    trainee={trainee}
                    onPlanWorkout={handlePlanWorkout}
                    onManageCost={handleManageCost}
                    onCancel={handleCancel}
                  />
                )
              )
            : null}
        </div>

        {invitaions.data.length > 0 ? (
          <div className="mb-8">
            <h3 className="font-bold mb-4">Pending invitations</h3>
            <div className="grid gap-4 grid-cols-3">
              {invitaions.data.map((invitation) => (
                <TraineeInvitationCard
                  key={invitation.id}
                  invitation={invitation}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
