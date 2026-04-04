"use client";

import { WorkoutDetail } from "@/components/WorkoutViewer/WorkoutDetail";
import { getPlannedWorkoutById } from "@/services/plannedWorkouts/getPlannedWorkoutById";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import dayjs from "dayjs";

type Props = {
  traineeId: string;
  workoutId: string;
  backTab?: "past" | "future";
};

export function PageContent({ traineeId, workoutId, backTab }: Props) {
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
    <section className="space-y-4">
      <PageSectionHeader
        eyebrow={
          data
            ? dayjs(data.plannedAt).format("ddd D MMM YYYY").toUpperCase()
            : "Workout"
        }
        title={data?.name ?? "Workout"}
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

      {isLoading ? (
        <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-4 text-sm text-[var(--shell-muted)]">
          Loading workout...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4 text-sm text-[var(--shell-accent)]">
          Could not load this workout.
        </div>
      ) : null}

      {data ? (
        <WorkoutDetail
          workout={data}
          viewerMode="athlete"
          traineeId={traineeId}
        />
      ) : null}
    </section>
  );
}
