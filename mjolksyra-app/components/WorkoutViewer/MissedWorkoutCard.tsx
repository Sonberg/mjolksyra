"use client";

import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { startWorkoutSession } from "@/services/completedWorkouts/startWorkoutSession";
import { skipPlannedWorkout } from "@/services/plannedWorkouts/skipPlannedWorkout";
import { unskipPlannedWorkout } from "@/services/plannedWorkouts/unskipPlannedWorkout";
import { StatusBadge } from "./StatusBadge";

type Props = {
  workout: PlannedWorkout;
  traineeId: string;
};

const UNDO_TIMEOUT_MS = 4000;

export function MissedWorkoutCard({ workout, traineeId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showUndo, setShowUndo] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startSessionMutation = useMutation({
    mutationFn: () =>
      startWorkoutSession({
        traineeId,
        plannedWorkoutId: workout.id,
      }),
    onSuccess: (created) => {
      router.push(`/app/athlete/${traineeId}/workouts/${created.id}?tab=completed`);
    },
  });

  const skipMutation = useMutation({
    mutationFn: () => skipPlannedWorkout({ traineeId, plannedWorkoutId: workout.id }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["planned-workouts", traineeId] });
      void queryClient.invalidateQueries({ queryKey: ["skipped-workouts", traineeId] });
      setShowUndo(true);
      undoTimerRef.current = setTimeout(() => setShowUndo(false), UNDO_TIMEOUT_MS);
    },
  });

  const unskipMutation = useMutation({
    mutationFn: () => unskipPlannedWorkout({ traineeId, plannedWorkoutId: workout.id }),
    onSuccess: () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      setShowUndo(false);
      void queryClient.invalidateQueries({ queryKey: ["planned-workouts", traineeId] });
      void queryClient.invalidateQueries({ queryKey: ["skipped-workouts", traineeId] });
    },
  });

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

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
      default:
        return date.format("dddd, D MMM YYYY");
    }
  }, [date]);

  const exercises = workout.publishedExercises;
  const totalExercises = exercises.length;
  const totalSets = exercises.reduce(
    (count, exercise) => count + (exercise.prescription?.sets?.length ?? 0),
    0,
  );

  return (
    <>
      <article className="overflow-hidden border border-[var(--shell-border)] bg-[var(--shell-surface)] opacity-80">
        <div className="border-b border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-3 sm:p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="min-w-0 flex gap-4">
              <p className="truncate text-base font-semibold text-[var(--shell-ink)]">
                {displayName}
              </p>
              <div className="flex items-center gap-2">
                <StatusBadge variant="subtle">Missed</StatusBadge>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => skipMutation.mutate()}
                disabled={skipMutation.isPending}
                className="inline-flex items-center border border-[var(--shell-border)] bg-transparent px-2.5 py-1.5 text-[11px] font-semibold text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface-strong)] disabled:opacity-60"
              >
                {skipMutation.isPending ? "Discarding..." : "Discard"}
              </button>
              <button
                type="button"
                onClick={() => startSessionMutation.mutate()}
                disabled={startSessionMutation.isPending}
                className="inline-flex items-center border border-transparent bg-[var(--shell-accent)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
              >
                {startSessionMutation.isPending ? "Starting..." : "Start session"}
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-3 bg-[var(--shell-surface)] p-3 text-[var(--shell-ink)] sm:space-y-4 sm:p-4">
          <div className="flex flex-wrap items-baseline gap-2">
            <StatusBadge variant="subtle">{totalExercises} exercises</StatusBadge>
            {totalSets > 0 ? (
              <StatusBadge variant="subtle">{totalSets} sets</StatusBadge>
            ) : null}
          </div>

          {workout.note?.trim() ? (
            <div className="border-l-2 border-[var(--shell-accent)] pl-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                Coach note
              </p>
              <p className="mt-1 text-sm text-[var(--shell-ink)]">{workout.note}</p>
            </div>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            {exercises.slice(0, 4).map((exercise, index) => (
              <div key={exercise.id} className="bg-[var(--shell-surface-strong)] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                  Exercise {index + 1}
                </p>
                <p className="mt-1 text-sm text-[var(--shell-muted)]">{exercise.name}</p>
              </div>
            ))}
          </div>

          {exercises.length > 4 ? (
            <p className="text-xs text-[var(--shell-muted)]">
              +{exercises.length - 4} more exercise{exercises.length - 4 > 1 ? "s" : ""}
            </p>
          ) : null}
        </div>
      </article>

      {showUndo ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3 shadow-lg">
            <span className="text-sm text-[var(--shell-ink)]">Workout skipped</span>
            <button
              type="button"
              onClick={() => unskipMutation.mutate()}
              disabled={unskipMutation.isPending}
              className="text-sm font-semibold text-[var(--shell-accent)] hover:underline disabled:opacity-60"
            >
              Undo
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
