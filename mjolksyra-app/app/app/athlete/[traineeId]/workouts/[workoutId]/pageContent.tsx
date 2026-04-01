"use client";

import { Workout } from "@/components/WorkoutViewer/Workout";
import { getPlannedWorkoutById } from "@/services/plannedWorkouts/getPlannedWorkoutById";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { PageHeader } from "@/components/Navigation/PageHeader";
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
      <PageHeader
        eyebrow={
          data
            ? dayjs(data.plannedAt).format("ddd D MMM YYYY").toUpperCase()
            : "Workout"
        }
        title={data?.name ?? "Workout"}
        sectionClassName="p-4 md:p-5"
        leading={
          <Link
            href={backHref}
            className="inline-flex h-9 w-9 items-center justify-center rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface)] hover:text-[var(--shell-ink)]"
            aria-label="Back to workouts"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
        }
      />

      {isLoading ? (
        <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-4 text-sm text-[var(--shell-muted)]">
          Loading workout...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4 text-sm text-[var(--shell-accent)]">
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
