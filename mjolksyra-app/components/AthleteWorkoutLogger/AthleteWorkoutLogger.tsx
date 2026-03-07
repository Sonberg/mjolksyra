"use client";

import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logPlannedWorkout } from "@/services/plannedWorkouts/logPlannedWorkout";
import { CheckCircle2Icon, ChevronLeftIcon } from "lucide-react";
import dayjs from "dayjs";
import Link from "next/link";
import { AthleteExerciseCard } from "./AthleteExerciseCard";
import {
  ToggleExerciseDoneInput,
  ToggleSetDoneInput,
  UpdateSetActualInput,
} from "@/components/WorkoutViewer/workout/types";

type Props = {
  workout: PlannedWorkout;
  traineeId: string;
  backHref: string;
};

export function AthleteWorkoutLogger({ workout, traineeId, backHref }: Props) {
  const queryClient = useQueryClient();
  const [isLogging, setIsLogging] = useState(false);
  const [completionNote, setCompletionNote] = useState(
    workout.completionNote ?? "",
  );

  function buildLogPayload(overrides: {
    completedAt?: Date | null;
    completionNote?: string | null;
    exerciseActualOverride?: {
      exerciseId: string;
      setIndex?: number;
      isDone?: boolean;
      weightKg?: number | null;
      reps?: number | null;
      durationSeconds?: number | null;
      distanceMeters?: number | null;
      note?: string | null;
      toggleSetDone?: boolean;
    };
  }) {
    return {
      completedAt:
        overrides.completedAt !== undefined
          ? overrides.completedAt
          : (workout.completedAt ?? null),
      completionNote:
        overrides.completionNote !== undefined
          ? overrides.completionNote
          : (workout.completionNote ?? null),
      exercises: workout.exercises.map((e) => ({
        id: e.id,
        sets: (e.prescription?.sets ?? []).map((s, idx) => {
          const override = overrides.exerciseActualOverride;
          if (override && override.exerciseId === e.id) {
            if (override.setIndex !== undefined && override.setIndex === idx) {
              return {
                reps:
                  override.reps !== undefined
                    ? override.reps
                    : (s.actual?.reps ?? null),
                weightKg:
                  override.weightKg !== undefined
                    ? override.weightKg
                    : (s.actual?.weightKg ?? null),
                durationSeconds:
                  override.durationSeconds !== undefined
                    ? override.durationSeconds
                    : (s.actual?.durationSeconds ?? null),
                distanceMeters:
                  override.distanceMeters !== undefined
                    ? override.distanceMeters
                    : (s.actual?.distanceMeters ?? null),
                note:
                  override.note !== undefined
                    ? override.note
                    : (s.actual?.note ?? null),
                isDone: override.toggleSetDone
                  ? !(s.actual?.isDone ?? false)
                  : override.isDone !== undefined
                    ? override.isDone
                    : (s.actual?.isDone ?? false),
              };
            }
            if (override.setIndex === undefined) {
              return {
                reps: s.actual?.reps ?? null,
                weightKg: s.actual?.weightKg ?? null,
                durationSeconds: s.actual?.durationSeconds ?? null,
                distanceMeters: s.actual?.distanceMeters ?? null,
                note: s.actual?.note ?? null,
                isDone:
                  override.isDone !== undefined
                    ? override.isDone
                    : (s.actual?.isDone ?? false),
              };
            }
          }
          return {
            reps: s.actual?.reps ?? null,
            weightKg: s.actual?.weightKg ?? null,
            durationSeconds: s.actual?.durationSeconds ?? null,
            distanceMeters: s.actual?.distanceMeters ?? null,
            note: s.actual?.note ?? null,
            isDone: s.actual?.isDone ?? false,
          };
        }),
      })),
    };
  }

  const saveCompletion = useMutation({
    mutationFn: async ({
      completedAt,
      completionNote,
    }: {
      completedAt: Date | null;
      completionNote: string | null;
    }) =>
      logPlannedWorkout({
        traineeId: workout.traineeId,
        plannedWorkoutId: workout.id,
        log: buildLogPayload({ completedAt, completionNote }),
      }),
    onSuccess: async () => {
      setIsLogging(false);
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
    },
  });

  const toggleExerciseDone = useMutation({
    mutationFn: async ({
      exerciseId,
      isDone,
    }: {
      exerciseId: string;
      isDone: boolean;
    }) =>
      logPlannedWorkout({
        traineeId: workout.traineeId,
        plannedWorkoutId: workout.id,
        log: buildLogPayload({
          exerciseActualOverride: { exerciseId, isDone },
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
    },
  });

  const toggleSetDone = useMutation({
    mutationFn: async ({
      exerciseId,
      setIndex,
    }: {
      exerciseId: string;
      setIndex: number;
    }) =>
      logPlannedWorkout({
        traineeId: workout.traineeId,
        plannedWorkoutId: workout.id,
        log: buildLogPayload({
          exerciseActualOverride: { exerciseId, setIndex, toggleSetDone: true },
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
    },
  });

  const updateSetActual = useMutation({
    mutationFn: async ({
      exerciseId,
      setIndex,
      weightKg,
      reps,
      durationSeconds,
      distanceMeters,
      note,
    }: UpdateSetActualInput) =>
      logPlannedWorkout({
        traineeId: workout.traineeId,
        plannedWorkoutId: workout.id,
        log: buildLogPayload({
          exerciseActualOverride: {
            exerciseId,
            setIndex,
            weightKg,
            reps,
            durationSeconds,
            distanceMeters,
            note,
          },
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
    },
  });

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
        return date.format("ddd D MMM YYYY");
    }
  }, [date]);

  const isCompleted = !!workout.completedAt;

  return (
    <div>
      {/* Header */}
      <div className="border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]"
            aria-label="Back to workouts"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
              {displayName} · {workout.name ?? "Workout"}
            </p>
            <p className="text-sm text-[var(--shell-muted)]">
              {date.format("ddd D MMM YYYY")}
            </p>
          </div>
          {isCompleted ? (
            <span className="inline-flex shrink-0 items-center gap-1 border-2 border-[var(--shell-border)] bg-[var(--shell-ink)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-surface)]">
              <CheckCircle2Icon className="h-3 w-3" />
              Done
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setCompletionNote(workout.completionNote ?? "");
              setIsLogging((x) => !x);
            }}
            className="hidden shrink-0 items-center gap-1.5 border-2 border-[var(--shell-border)] bg-[var(--shell-accent)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-accent-ink)] transition hover:brightness-95 sm:inline-flex"
          >
            <CheckCircle2Icon className="h-3.5 w-3.5" />
            {isCompleted ? "Edit completion" : "Complete workout"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 pb-28 pt-4 sm:pb-6">
        {/* Coach note */}
        {workout.note?.trim() ? (
          <div className="border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
              Coach note
            </p>
            <p className="mt-1 text-sm text-[var(--shell-ink)]">{workout.note}</p>
          </div>
        ) : null}

        {/* Athlete log (shown after completion) */}
        {isCompleted && workout.completionNote?.trim() ? (
          <div className="border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
              Your log
            </p>
            <p className="mt-1 text-sm text-[var(--shell-ink)]">
              {workout.completionNote}
            </p>
          </div>
        ) : null}

        {/* Coach feedback */}
        {workout.reviewNote?.trim() ? (
          <div className="border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
              Coach feedback
            </p>
            <p className="mt-1 text-sm text-[var(--shell-ink)]">
              {workout.reviewNote}
            </p>
          </div>
        ) : null}

        {/* Exercises */}
        {workout.exercises.map((exercise, index) => (
          <AthleteExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={index}
            isToggleExerciseDonePending={toggleExerciseDone.isPending}
            isSetActionPending={
              toggleSetDone.isPending || updateSetActual.isPending
            }
            onToggleExerciseDone={(input: ToggleExerciseDoneInput) =>
              toggleExerciseDone.mutate(input)
            }
            onToggleSetDone={(input: ToggleSetDoneInput) =>
              toggleSetDone.mutate(input)
            }
            onUpdateSetActual={(input: UpdateSetActualInput) =>
              updateSetActual.mutate(input)
            }
          />
        ))}

        {/* Completion form */}
        {isLogging ? (
          <div className="border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
              Completion note (optional)
            </p>
            <textarea
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              rows={3}
              placeholder="How did it feel? Any notes for your coach?"
              className="mt-2 w-full resize-y border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-sm text-[var(--shell-ink)] outline-none placeholder:text-[var(--shell-muted)]"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={saveCompletion.isPending}
                onClick={() =>
                  saveCompletion.mutate({
                    completedAt: new Date(),
                    completionNote: completionNote.trim() || null,
                  })
                }
                className="flex-1 border-2 border-[var(--shell-border)] bg-[var(--shell-accent)] py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
              >
                {saveCompletion.isPending ? "Saving..." : "Save completion"}
              </button>
              <button
                type="button"
                onClick={() => setIsLogging(false)}
                className="border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface-strong)]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Sticky bottom bar — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[var(--shell-border)] bg-[var(--shell-bg)] px-4 py-4 sm:hidden">
        <div className="mx-auto max-w-6xl">
          <button
            type="button"
            onClick={() => {
              setCompletionNote(workout.completionNote ?? "");
              setIsLogging((x) => !x);
            }}
            className="flex w-full items-center justify-center gap-2 border-2 border-[var(--shell-border)] bg-[var(--shell-accent)] py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--shell-accent-ink)] transition hover:brightness-95"
          >
            <CheckCircle2Icon className="h-5 w-5" />
            {isCompleted ? "Edit completion" : "Complete workout"}
          </button>
        </div>
      </div>
    </div>
  );
}
