"use client";

import { WorkoutDetail } from "@/components/WorkoutViewer/WorkoutDetail";
import { getWorkoutSession } from "@/services/completedWorkouts/getWorkoutSession";
import { useQuery } from "@tanstack/react-query";
import type { WorkoutResponse } from "@/services/completedWorkouts/type";

type Props = {
  traineeId: string;
  workoutId: string;
  backTab?: "past" | "future";
};

export function WorkoutDetails({ traineeId, workoutId, backTab }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["workout-session", traineeId, workoutId],
    queryFn: ({ signal: _signal }) =>
      getWorkoutSession({
        traineeId,
        plannedWorkoutId: workoutId,
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
        <WorkoutDetailsPanel
          data={data}
          traineeId={traineeId}
          backTab={backTab}
        />
      ) : null}
    </div>
  );
}

function WorkoutDetailsPanel({
  data,
  traineeId,
  backTab,
}: {
  data: WorkoutResponse;
  traineeId: string;
  backTab?: "past" | "future";
}) {
  const { session, ...workout } = data;
  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      <WorkoutDetail
        workout={workout}
        session={session}
        traineeId={traineeId}
        backTab={backTab}
        viewerMode="athlete"
      />
    </div>
  );
}
