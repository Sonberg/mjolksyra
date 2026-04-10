"use client";

import { WorkoutDetail } from "@/components/WorkoutViewer/WorkoutDetail";
import { getWorkoutSession } from "@/services/completedWorkouts/getWorkoutSession";
import { useQuery } from "@tanstack/react-query";

type Props = {
  traineeId: string;
  workoutId: string;
};

export function WorkoutDetails({ traineeId, workoutId }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["workout-session", traineeId, workoutId],
    queryFn: ({ signal }) =>
      getWorkoutSession({
        traineeId,
        completedWorkoutId: workoutId,
        signal,
      }),
    retry: false,
  });

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] min-h-[600px] w-full flex-col overflow-hidden">
      {isLoading ? (
        <div className="flex-none p-4 text-sm text-[var(--shell-muted)]">
          Loading workout...
        </div>
      ) : null}
      {isError ? (
        <div className="flex-none p-4 text-sm text-[var(--shell-accent)]">
          Could not load this workout.
        </div>
      ) : null}
      {data ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <WorkoutDetail workout={data} viewerMode="athlete" />
        </div>
      ) : null}
    </div>
  );
}
