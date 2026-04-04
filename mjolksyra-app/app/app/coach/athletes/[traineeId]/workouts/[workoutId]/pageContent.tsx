"use client";

import { CoachWorkspaceShell } from "../../../../CoachWorkspaceShell";
import { WorkoutDetail } from "@/components/WorkoutViewer/WorkoutDetail";
import { useQuery } from "@tanstack/react-query";
import { getPlannedWorkoutById } from "@/services/plannedWorkouts/getPlannedWorkoutById";
import { getTrainee } from "@/services/trainees/getTrainee";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";

type Props = {
  traineeId: string;
  workoutId: string;
  backTab?: "past" | "future" | "changes";
};

export function PageContent({ traineeId, workoutId, backTab }: Props) {
  const { data: trainee } = useQuery({
    queryKey: ["trainees", traineeId, "workoutReviewDetailHeader"],
    queryFn: ({ signal }) => getTrainee({ id: traineeId, signal }),
  });

  const workout = useQuery({
    queryKey: ["planned-workout", traineeId, workoutId],
    queryFn: ({ signal }) =>
      getPlannedWorkoutById({
        traineeId,
        plannedWorkoutId: workoutId,
        signal,
      }),
    retry: false,
  });

  const athleteName =
    trainee?.athlete?.givenName || trainee?.athlete?.familyName
      ? `${trainee?.athlete?.givenName ?? ""} ${trainee?.athlete?.familyName ?? ""}`.trim()
      : trainee?.athlete?.name || "Athlete";
  const backHref = backTab
    ? `/app/coach/athletes/${traineeId}/workouts?tab=${backTab}`
    : `/app/coach/athletes/${traineeId}/workouts`;

  return (
    <CoachWorkspaceShell>
      <PageSectionHeader
        eyebrow="Workout"
        title={athleteName}
        titleClassName="text-xl md:text-2xl"
        leading={
          <Link
            href={backHref}
            className="inline-flex items-center text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]"
            aria-label="Back to workouts"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
        }
      />

      {workout.isLoading ? (
        <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-4 text-sm text-[var(--shell-muted)]">
          Loading workout...
        </section>
      ) : null}
      {workout.isError ? (
        <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-4 text-sm text-[var(--shell-accent)]">
          Could not load this workout.
        </section>
      ) : null}
      {workout.data ? (
        <WorkoutDetail
          workout={workout.data}
          viewerMode="coach"
          traineeId={traineeId}
          backTab={backTab}
        />
      ) : null}
    </CoachWorkspaceShell>
  );
}
