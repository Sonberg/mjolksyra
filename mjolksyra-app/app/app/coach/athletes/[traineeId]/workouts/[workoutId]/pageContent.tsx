"use client";

import { CoachWorkspaceShell } from "../../../../CoachWorkspaceShell";
import { WorkoutDetail } from "@/components/WorkoutViewer/WorkoutDetail";
import { useQuery } from "@tanstack/react-query";
import { getPlannedWorkoutById } from "@/services/plannedWorkouts/getPlannedWorkoutById";
import { getTrainee } from "@/services/trainees/getTrainee";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import type { PlannedWorkout } from "@/services/plannedWorkouts/type";
import type { Trainee } from "@/services/trainees/type";

type Props = {
  traineeId: string;
  workoutId: string;
  backTab?: "past" | "future" | "changes";
  initialWorkout?: PlannedWorkout | null;
  initialTrainee?: Trainee | null;
};

export function PageContent({ traineeId, workoutId, backTab, initialWorkout, initialTrainee }: Props) {
  const { data: trainee } = useQuery({
    queryKey: ["trainees", traineeId, "workoutReviewDetailHeader"],
    queryFn: ({ signal }) => getTrainee({ id: traineeId, signal }),
    initialData: initialTrainee ?? undefined,
  });

  const workout = useQuery({
    queryKey: ["planned-workout", traineeId, workoutId],
    queryFn: ({ signal }) =>
      getPlannedWorkoutById({
        traineeId,
        plannedWorkoutId: workoutId,
        signal,
      }),
    initialData: initialWorkout ?? undefined,
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
    <CoachWorkspaceShell fullBleed>
      <div className="flex h-[calc(100dvh-7.5rem)] min-h-[600px] w-full flex-col overflow-hidden">
        {/* Compact page header */}
        <div className="flex-none flex items-center gap-3 border-b border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3 md:px-6">
          <Link
            href={backHref}
            className="inline-flex items-center text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]"
            aria-label="Back to workouts"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">Workout</p>
            <p className="truncate text-base font-semibold text-[var(--shell-ink)]">{athleteName}</p>
          </div>
        </div>

        {workout.isLoading ? (
          <div className="flex-none border-b border-[var(--shell-border)] p-4 text-sm text-[var(--shell-muted)]">
            Loading workout...
          </div>
        ) : null}
        {workout.isError ? (
          <div className="flex-none border-b border-[var(--shell-border)] p-4 text-sm text-[var(--shell-accent)]">
            Could not load this workout.
          </div>
        ) : null}
        {workout.data ? (
          <div className="flex-1 min-h-0 overflow-hidden">
            <WorkoutDetail
              workout={workout.data}
              viewerMode="coach"
              traineeId={traineeId}
              backTab={backTab}
            />
          </div>
        ) : null}
      </div>
    </CoachWorkspaceShell>
  );
}
