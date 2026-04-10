"use client";

import { PlannedWorkoutDetail } from "@/components/WorkoutViewer/PlannedWorkoutDetail";
import { getPlannedWorkoutById } from "@/services/plannedWorkouts/getPlannedWorkoutById";
import { useQuery } from "@tanstack/react-query";

type Props = {
  traineeId: string;
  plannedWorkoutId: string;
  viewerMode: "athlete" | "coach";
};

export function PlannedWorkoutLoader({ traineeId, plannedWorkoutId, viewerMode }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["planned-workout", traineeId, plannedWorkoutId],
    queryFn: ({ signal }) =>
      getPlannedWorkoutById({
        traineeId,
        plannedWorkoutId,
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
          <PlannedWorkoutDetail workout={data} viewerMode={viewerMode} />
        </div>
      ) : null}
    </div>
  );
}
