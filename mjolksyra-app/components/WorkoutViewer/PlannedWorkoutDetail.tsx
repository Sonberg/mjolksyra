"use client";

import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startWorkoutSession } from "@/services/completedWorkouts/startWorkoutSession";
import { useRouter } from "next/navigation";
import { StatusBadge } from "./StatusBadge";

type Props = {
  workout: PlannedWorkout;
  viewerMode: "athlete" | "coach";
};

export function PlannedWorkoutDetail({ workout, viewerMode }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const date = useMemo(() => {
    const [year, month, day] = workout.plannedAt.split("-");
    return dayjs()
      .year(Number(year))
      .month(Number(month) - 1)
      .date(Number(day));
  }, [workout.plannedAt]);

  const displayName = useMemo(() => {
    const today = dayjs();
    const diff = date.diff(today, "days");
    switch (diff) {
      case -1:
        return "Yesterday";
      case 0:
        return "Today";
      case 1:
        return "Tomorrow";
      default:
        return date.format("dddd, D MMM YYYY");
    }
  }, [date]);

  const startSessionMutation = useMutation({
    mutationFn: async () =>
      startWorkoutSession({
        traineeId: workout.traineeId,
        plannedWorkoutId: workout.id,
      }),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["completed-workouts"] });
      router.push(`/app/athlete/${workout.traineeId}/workouts/${created.id}?tab=completed`);
    },
  });

  return (
    <article className="flex h-full flex-col overflow-hidden bg-[var(--shell-surface)]">
      <div className="flex-none border-b border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-[var(--shell-ink)]">{displayName}</p>
            <p className="mt-1 text-[11px] text-[var(--shell-muted)]">
              Planned workout
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge variant="subtle">Planned</StatusBadge>
            {viewerMode === "athlete" ? (
              <button
                type="button"
                onClick={() => startSessionMutation.mutate()}
                disabled={startSessionMutation.isPending}
                className="inline-flex items-center border border-transparent bg-[var(--shell-accent)] px-3 py-2 text-xs font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
              >
                {startSessionMutation.isPending ? "Starting..." : "Start session"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {workout.note?.trim() ? (
          <div className="mb-4 border-l-2 border-[var(--shell-accent)] pl-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
              Coach note
            </p>
            <p className="mt-1 text-sm text-[var(--shell-ink)]">
              {workout.note}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          {workout.publishedExercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className="border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                Exercise {index + 1}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--shell-ink)]">
                {exercise.name}
              </p>
              {exercise.note ? (
                <p className="mt-1 text-sm text-[var(--shell-muted)]">{exercise.note}</p>
              ) : null}
              {(exercise.prescription?.sets?.length ?? 0) > 0 ? (
                <div className="mt-3 flex flex-col gap-1.5">
                  {exercise.prescription?.sets?.map((set, setIndex) => (
                    <div
                      key={`${exercise.id}-${setIndex}`}
                      className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--shell-muted)]"
                    >
                      <span>Set {setIndex + 1}</span>
                      {set.target?.reps != null ? <span>{set.target.reps} reps</span> : null}
                      {set.target?.weightKg != null ? <span>{set.target.weightKg} kg</span> : null}
                      {set.target?.durationSeconds != null ? <span>{set.target.durationSeconds}s</span> : null}
                      {set.target?.distanceMeters != null ? <span>{set.target.distanceMeters} m</span> : null}
                      {set.target?.note ? <span>{set.target.note}</span> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
