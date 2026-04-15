"use client";

import { Button } from "@/components/ui/button";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import { InviteTraineeDialog } from "@/dialogs/InviteTraineeDialog";
import { getTraineeInvitations } from "@/services/traineeInvitations/getTraineeInvitations";
import { getPlannedWorkouts } from "@/services/plannedWorkouts/getPlannedWorkout";
import { Trainee } from "@/services/trainees/type";
import { useQuery } from "@tanstack/react-query";
import { UserPlusIcon } from "lucide-react";
import { TraineeCard } from "./TraineeCard";
import { TraineeInvitationCard } from "./TraineeInvitationCard";

type Props = {
  trainees: Trainee[];
};

export function CoachAthletesContent({ trainees }: Props) {
  const includedAthletes = 10;
  const overageAthletes = Math.max(0, trainees.length - includedAthletes);
  const invitaions = useQuery({
    queryKey: ["invitations"],
    queryFn: ({ signal }) => getTraineeInvitations({ signal, type: "coach" }),
    initialData: [],
  });
  const unpublishedChanges = useQuery({
    queryKey: ["trainees-unpublished-changes", trainees.map((x) => x.id)],
    enabled: trainees.length > 0,
    queryFn: async () => {
      const hasUnpublishedChangesByTraineeId: Record<string, boolean> = {};

      await Promise.all(
        trainees.map(async (trainee) => {
          let next: string | undefined;
          let hasUnpublished = false;

          for (let page = 0; page < 10 && !hasUnpublished; page += 1) {
            const response = await getPlannedWorkouts({
              traineeId: trainee.id,
              next,
              limit: 100,
              sortBy: "plannedAt",
              order: "desc",
            });

            hasUnpublished = response.data.some((workout) =>
              (workout.draftExercises ?? workout.publishedExercises).some((exercise) => !exercise.isPublished),
            );

            if (!response.next) {
              break;
            }

            next = response.next;
          }

          hasUnpublishedChangesByTraineeId[trainee.id] = hasUnpublished;
        }),
      );

      return hasUnpublishedChangesByTraineeId;
    },
    initialData: {},
  });

  return (
    <div className="space-y-8">
      <PageSectionHeader
        title="Athletes"
        description={
          <div className="space-y-0.5">
            <p>Manage pricing, workouts, and coach relationships.</p>
            <p>
              {trainees.length} active athlete{trainees.length === 1 ? "" : "s"}
              . $39/mo includes {includedAthletes}; overage: $
              {overageAthletes * 4}/mo.
            </p>
          </div>
        }
        actions={
          <InviteTraineeDialog
            onCompletion={async () => {
              await invitaions.refetch();
            }}
            trigger={
              <Button
                disabled={false}
                className="inline-flex items-center gap-2 rounded-none border border-transparent bg-[var(--shell-accent)] px-5 py-2 font-semibold text-[var(--shell-accent-ink)] transition hover:bg-[var(--shell-accent-hover)]"
                size="lg"
              >
                <UserPlusIcon className="h-5 w-5" />
                Invite Athlete
              </Button>
            }
          />
        }
      />

      {trainees.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {trainees.map((trainee) => (
            <TraineeCard
              key={trainee.id}
              trainee={trainee}
              hasUnpublishedChanges={
                unpublishedChanges.data[trainee.id] ?? false
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-none border border-dashed border-[var(--shell-border)] bg-[var(--shell-surface)] p-12 text-center">
          <h3 className="text-xl text-[var(--shell-ink)]">No athletes yet</h3>
          <p className="mt-2 text-sm text-[var(--shell-muted)]">
            Send your first invitation to start building your coaching roster.
          </p>
        </div>
      )}

      {invitaions.data.length > 0 ? (
        <section className="space-y-4">
          <h3 className="text-lg text-[var(--shell-ink)]">
            Pending invitations
          </h3>
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
