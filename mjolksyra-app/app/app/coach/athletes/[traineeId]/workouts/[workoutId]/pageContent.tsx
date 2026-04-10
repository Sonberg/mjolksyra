"use client";

import { CoachWorkspaceShell } from "../../../../CoachWorkspaceShell";
import { WorkoutDetail } from "@/components/WorkoutViewer/WorkoutDetail";
import { useQuery } from "@tanstack/react-query";
import { getWorkoutSession } from "@/services/completedWorkouts/getWorkoutSession";
import { getTrainee } from "@/services/trainees/getTrainee";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import type { Trainee } from "@/services/trainees/type";
import type { CompletedWorkout } from "@/services/completedWorkouts/type";

type Props = {
  traineeId: string;
  workoutId: string;
  backTab?: "planned" | "completed";
  initialWorkoutResponse?: CompletedWorkout | null;
  initialTrainee?: Trainee | null;
};

export function PageContent({ traineeId, workoutId, backTab, initialWorkoutResponse, initialTrainee }: Props) {
  const { data: trainee } = useQuery({
    queryKey: ["trainees", traineeId, "workoutReviewDetailHeader"],
    queryFn: ({ signal }) => getTrainee({ id: traineeId, signal }),
    initialData: initialTrainee ?? undefined,
  });

  const workoutQuery = useQuery({
    queryKey: ["workout-session", traineeId, workoutId],
    queryFn: () =>
      getWorkoutSession({
        traineeId,
        completedWorkoutId: workoutId,
      }),
    initialData: initialWorkoutResponse ?? undefined,
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">Completed workout</p>
            <p className="truncate text-base font-semibold text-[var(--shell-ink)]">{athleteName}</p>
          </div>
        </div>

        {workoutQuery.isLoading ? (
          <div className="flex-none border-b border-[var(--shell-border)] p-4 text-sm text-[var(--shell-muted)]">
            Loading workout...
          </div>
        ) : null}
        {workoutQuery.isError ? (
          <div className="flex-none border-b border-[var(--shell-border)] p-4 text-sm text-[var(--shell-accent)]">
            Could not load this workout.
          </div>
        ) : null}
        {workoutQuery.data ? (() => {
          return (
            <div className="flex-1 min-h-0 overflow-hidden">
              <WorkoutDetail
                workout={workoutQuery.data}
                viewerMode="coach"
              />
            </div>
          );
        })() : null}
      </div>
    </CoachWorkspaceShell>
  );
}
