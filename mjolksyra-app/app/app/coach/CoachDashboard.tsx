import { InviteTraineeDialog } from "@/dialogs/InviteTraineeDialog";
import { UserPlusIcon } from "lucide-react";
import { TraineeCard } from "./TraineeCard";
import { TraineeInvitationCard } from "./TraineeInvitationCard";
import { getTraineeInvitations } from "@/services/traineeInvitations/getTraineeInvitations";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Trainee } from "@/services/trainees/type";

type Props = {
  trainees: Trainee[];
};

export function CoachDashboard({ trainees }: Props) {
  const invitaions = useQuery({
    queryKey: ["invitations"],
    queryFn: ({ signal }) => getTraineeInvitations({ signal, type: "coach" }),
    initialData: [],
  });

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur-sm md:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Roster overview
            </p>
            <h2 className="text-2xl font-semibold text-white md:text-3xl">
              Athletes
            </h2>
            <p className="text-sm text-zinc-400">
              {trainees.length} active athlete{trainees.length === 1 ? "" : "s"}
            </p>
          </div>
          <InviteTraineeDialog
            onCompletion={async () => {
              await invitaions.refetch();
            }}
            trigger={
              <Button
                disabled={false}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-200/20 bg-cyan-300/10 px-5 py-2 font-semibold text-cyan-50 transition hover:bg-cyan-300/20"
                size="lg"
              >
                <UserPlusIcon className="h-5 w-5" />
                Invite Athlete
              </Button>
            }
          />
        </div>
      </section>

      {trainees.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {trainees.map((trainee) => (
            <TraineeCard key={trainee.id} trainee={trainee} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/20 bg-zinc-950/70 p-12 text-center">
          <h3 className="text-xl font-semibold text-white">No athletes yet</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Send your first invitation to start building your coaching roster.
          </p>
        </div>
      )}

      {invitaions.data.length > 0 ? (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Pending invitations</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {invitaions.data.map((invitation) => (
              <TraineeInvitationCard
                key={invitation.id}
                invitation={invitation}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
