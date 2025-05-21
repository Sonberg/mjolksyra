import { InviteTraineeDialog } from "@/dialogs/InviteTraineeDialog";
import { UserPlusIcon } from "lucide-react";
import { TraineeCard } from "./TraineeCard";
import { TraineeInvitationCard } from "./TraineeInvitationCard";
import { useRouter } from "next/router";
import { getTraineeInvitations } from "@/services/traineeInvitations/getTraineeInvitations";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Trainee } from "@/services/trainees/type";

type Props = {
  trainees: Trainee[];
};

export function CoachDashboard({ trainees }: Props) {
  const router = useRouter();
  const invitaions = useQuery({
    queryKey: ["invitations"],
    queryFn: ({ signal }) => getTraineeInvitations({ signal, type: "coach" }),
    initialData: [],
  });

  return (
    <>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {trainees.map((trainee) => (
          <TraineeCard key={trainee.id} trainee={trainee} />
        ))}
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
    </>
  );
}
