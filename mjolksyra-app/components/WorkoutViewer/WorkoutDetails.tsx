"use client";

import { Workout } from "@/components/WorkoutViewer/Workout";
import { getPlannedWorkoutById } from "@/services/plannedWorkouts/getPlannedWorkoutById";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

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

  const backHref = backTab
    ? `/app/athlete/${traineeId}/workouts?tab=${backTab}`
    : `/app/athlete/${traineeId}/workouts`;

  return (
    <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <Link
          href={backHref}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          aria-label="Back to workouts"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Workout details
          </p>
          <h1 className="text-xl font-semibold text-zinc-100 md:text-2xl">
            Log sets and complete exercises
          </h1>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
          Loading workout...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
          Could not load this workout.
        </div>
      ) : null}

      {data ? (
        <Workout
          workout={data}
          viewerMode="athlete"
          traineeId={traineeId}
          isDetailView
        />
      ) : null}
    </section>
  );
}
