"use client";

import { WorkoutDetail } from "@/components/WorkoutViewer/WorkoutDetail";
import { getPlannedWorkoutById } from "@/services/plannedWorkouts/getPlannedWorkoutById";
import { useQuery } from "@tanstack/react-query";

type Props = {
  traineeId: string;
  workoutId: string;
  backTab?: "past" | "future";
};

export function WorkoutDetails({ traineeId, workoutId, backTab }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["planned-workout", traineeId, workoutId],
    queryFn: ({ signal }) =>
      getPlannedWorkoutById({
        traineeId,
        plannedWorkoutId: workoutId,
        signal,
      }),
    retry: false,
  });

  return (
    <section className="grid gap-4">
      {isLoading ? (
        <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-4 text-sm text-[var(--shell-muted)]">
          Loading workout...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-4 text-sm text-[var(--shell-accent)]">
          Could not load this workout.
        </div>
      ) : null}

      {data ? (
        <WorkoutDetail
          workout={data}
          traineeId={traineeId}
          backTab={backTab}
          viewerMode="athlete"
        />
      ) : null}
    </section>
  );
}
