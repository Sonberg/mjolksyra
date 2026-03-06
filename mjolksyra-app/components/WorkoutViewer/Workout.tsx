"use client";

import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { Card, CardHeader, CardContent } from "../ui/card";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePlannedWorkout } from "@/services/plannedWorkouts/updatePlannedWorkout";
import { logPlannedWorkout } from "@/services/plannedWorkouts/logPlannedWorkout";
import { CheckCircle2Icon, RotateCcwIcon } from "lucide-react";
import { ExercisePrescriptionTargetType } from "@/lib/exercisePrescription";
import Link from "next/link";
import { WorkoutExerciseCard } from "./workout/WorkoutExerciseCard";
import {
  ToggleExerciseDoneInput,
  ToggleSetDoneInput,
  UpdateSetActualInput,
} from "./workout/types";

type Props = {
  workout: PlannedWorkout;
  viewerMode?: "athlete" | "coach";
  isHighlighted?: boolean;
  traineeId?: string;
  isDetailView?: boolean;
  backTab?: "past" | "future";
};

export function Workout({
  workout,
  viewerMode = "athlete",
  isHighlighted = false,
  traineeId,
  isDetailView = false,
  backTab,
}: Props) {
  const queryClient = useQueryClient();
  const [isLogging, setIsLogging] = useState(false);
  const [completionNote, setCompletionNote] = useState(
    workout.completionNote ?? "",
  );
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewNote, setReviewNote] = useState(workout.reviewNote ?? "");

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
    },
  });
  const saveReview = useMutation({
    mutationFn: async ({
      reviewedAt,
      reviewNote,
    }: {
      reviewedAt: Date | null;
      reviewNote: string | null;
    }) =>
      updatePlannedWorkout({
        plannedWorkout: {
          ...workout,
          reviewedAt,
          reviewNote,
        },
      }),
    onSuccess: async () => {
      setIsReviewing(false);
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
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
  const updateSetWeight = useMutation({
    mutationFn: async ({
      exerciseId,
      setIndex,
      weightKg,
      reps,
      durationSeconds,
      distanceMeters,
      note,
    }: {
      exerciseId: string;
      setIndex: number;
      weightKg: number | null;
      reps: number | null;
      durationSeconds: number | null;
      distanceMeters: number | null;
      note: string | null;
    }) =>
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
        return date.format("dddd, D MMM YYYY");
    }
  }, [date]);

  const isCompleted = !!workout.completedAt;
  const isReviewed = !!workout.reviewedAt;

  function getSetTargetLabel(
    targetType: string | undefined,
    target:
      | {
          reps: number | null;
          durationSeconds: number | null;
          distanceMeters: number | null;
        }
      | null
      | undefined,
  ) {
    if (targetType === ExercisePrescriptionTargetType.DurationSeconds) {
      return `${target?.durationSeconds ?? "-"} s`;
    }

    if (targetType === ExercisePrescriptionTargetType.DistanceMeters) {
      return `${target?.distanceMeters ?? "-"} m`;
    }

    return `${target?.reps ?? "-"} reps`;
  }

  useEffect(() => {
    setCompletionNote(workout.completionNote ?? "");
    setReviewNote(workout.reviewNote ?? "");
  }, [workout.completionNote, workout.reviewNote]);

  useEffect(() => {
    if (!isHighlighted) {
      return;
    }

    const element = document.getElementById(`workout-${workout.id}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isHighlighted, workout.id]);

  return (
    <Card
      id={`workout-${workout.id}`}
      data-today={displayName === "Today"}
      className={
        isHighlighted
          ? "overflow-hidden rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] ring-2 ring-[var(--shell-accent)]/30"
          : "overflow-hidden rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)]"
      }
    >
      <CardHeader className="border-b-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-3 font-semibold text-[var(--shell-ink)] sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="truncate">{displayName}</span>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {viewerMode === "athlete" && !isDetailView && traineeId ? (
              <Link
                href={
                  backTab
                    ? `/app/athlete/${traineeId}/workouts/${workout.id}?tab=${backTab}`
                    : `/app/athlete/${traineeId}/workouts/${workout.id}`
                }
                className="inline-flex items-center rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-ink)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--shell-surface)] transition hover:bg-[var(--shell-ink-soft)]"
              >
                Open workout
              </Link>
            ) : null}
            {viewerMode === "athlete" && isDetailView ? (
              <button
                type="button"
                onClick={() => {
                  setCompletionNote(workout.completionNote ?? "");
                  setIsLogging((x) => !x);
                }}
                className="inline-flex items-center rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-accent)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--shell-surface)] transition hover:brightness-95"
              >
                {isCompleted ? "Edit completion" : "Complete workout"}
              </button>
            ) : null}
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-ink)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-surface)]">
                  <CheckCircle2Icon className="h-3 w-3" />
                  Completed
                </span>
              ) : null}
              {viewerMode === "coach" && isReviewed ? (
                <span className="inline-flex items-center gap-1 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-ink)]">
                  Reviewed
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 bg-[var(--shell-surface)] p-3 text-[var(--shell-ink)] sm:gap-4 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          {viewerMode === "athlete" ? (
            <>
              {isDetailView && isCompleted ? (
                <button
                  type="button"
                  disabled={saveCompletion.isPending}
                  onClick={() =>
                    saveCompletion.mutate({
                      completedAt: null,
                      completionNote: workout.completionNote ?? null,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:opacity-60"
                >
                  <RotateCcwIcon className="h-3.5 w-3.5" />
                  Mark incomplete
                </button>
              ) : null}
              {!isDetailView && isCompleted ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-ink)] px-3 py-2 text-xs font-semibold text-[var(--shell-surface)]"
                >
                  <CheckCircle2Icon className="h-3.5 w-3.5" />
                  Completed
                </button>
              ) : null}
            </>
          ) : isCompleted ? (
            <>
              {!isReviewed ? (
                <button
                  type="button"
                  disabled={saveReview.isPending}
                  onClick={() =>
                    saveReview.mutate({
                      reviewedAt: new Date(),
                      reviewNote: reviewNote.trim() || null,
                    })
                  }
                  className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-accent)] px-3 py-2 text-xs font-semibold text-[var(--shell-surface)] transition hover:brightness-95 disabled:opacity-60"
                >
                  {saveReview.isPending ? "Saving..." : "Mark reviewed"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saveReview.isPending}
                  onClick={() =>
                    saveReview.mutate({
                      reviewedAt: null,
                      reviewNote: reviewNote.trim() || null,
                    })
                  }
                  className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:opacity-60"
                >
                  {saveReview.isPending ? "Saving..." : "Unmark reviewed"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsReviewing((x) => !x)}
                className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-xs font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface-strong)]"
              >
                {isReviewing ? "Hide review details" : "Review details"}
              </button>
            </>
          ) : null}
          {workout.completedAt ? (
            <span className="text-xs text-[var(--shell-muted)]">
              Completed {new Date(workout.completedAt).toLocaleString()}
            </span>
          ) : null}
          {viewerMode === "coach" && workout.reviewedAt ? (
            <span className="text-xs text-[var(--shell-muted)]">
              Reviewed {new Date(workout.reviewedAt).toLocaleString()}
            </span>
          ) : null}
        </div>

        {isDetailView && isLogging ? (
          <div className="grid gap-3 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                Completion note (optional)
              </p>
              <textarea
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                rows={3}
                placeholder="How did it feel? Any notes to your coach?"
                className="mt-2 w-full resize-y rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-sm text-[var(--shell-ink)] outline-none placeholder:text-[var(--shell-muted)]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saveCompletion.isPending}
                onClick={() =>
                  saveCompletion.mutate({
                    completedAt: new Date(),
                    completionNote: completionNote.trim() || null,
                  })
                }
                className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-accent)] px-3 py-2 text-xs font-semibold text-[var(--shell-surface)] transition hover:brightness-95 disabled:opacity-60"
              >
                {saveCompletion.isPending ? "Saving..." : "Save completion"}
              </button>
              <button
                type="button"
                disabled={saveCompletion.isPending}
                onClick={() => setIsLogging(false)}
                className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-xs font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface-strong)] disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {workout.note?.trim() ? (
          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
              Coach note
            </p>
            <p className="mt-1 text-sm text-[var(--shell-ink)]">
              {workout.note}
            </p>
          </div>
        ) : null}
        {(isDetailView || viewerMode === "coach") &&
        workout.completionNote?.trim() ? (
          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
              {viewerMode === "coach" ? "Athlete log" : "Your log"}
            </p>
            <p className="mt-1 text-sm text-[var(--shell-ink)]">
              {workout.completionNote}
            </p>
          </div>
        ) : null}
        {viewerMode === "coach" &&
        isReviewing &&
        !workout.completionNote?.trim() ? (
          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-sm text-[var(--shell-muted)]">
            Athlete completed this workout without a completion note.
          </div>
        ) : null}
        {viewerMode === "coach" && isReviewing ? (
          <div className="grid gap-3 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                Coach log
              </p>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                placeholder="Feedback for the athlete, notes for follow-up, or coaching observations."
                className="mt-2 w-full resize-y rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-sm text-[var(--shell-ink)] outline-none placeholder:text-[var(--shell-muted)]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saveReview.isPending}
                onClick={() =>
                  saveReview.mutate({
                    reviewedAt: workout.reviewedAt
                      ? new Date(workout.reviewedAt)
                      : null,
                    reviewNote: reviewNote.trim() || null,
                  })
                }
                className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-ink)] px-3 py-2 text-xs font-semibold text-[var(--shell-surface)] transition hover:bg-[var(--shell-ink-soft)] disabled:opacity-60"
              >
                {saveReview.isPending ? "Saving..." : "Save coach log"}
              </button>
            </div>
          </div>
        ) : null}
        {viewerMode === "coach" &&
        workout.reviewNote?.trim() &&
        !isReviewing ? (
          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
              Coach log
            </p>
            <p className="mt-1 text-sm text-[var(--shell-ink)]">
              {workout.reviewNote}
            </p>
          </div>
        ) : null}
        {viewerMode === "athlete" && workout.reviewNote?.trim() ? (
          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
              Coach feedback
            </p>
            <p className="mt-1 text-sm text-[var(--shell-ink)]">
              {workout.reviewNote}
            </p>
          </div>
        ) : null}
        {workout.exercises.map((exercise, index) => (
          <WorkoutExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={index}
            viewerMode={viewerMode}
            isDetailView={isDetailView}
            isToggleExerciseDonePending={toggleExerciseDone.isPending}
            isSetActionPending={
              toggleSetDone.isPending || updateSetWeight.isPending
            }
            getSetTargetLabel={getSetTargetLabel}
            onToggleExerciseDone={(input: ToggleExerciseDoneInput) =>
              toggleExerciseDone.mutate(input)
            }
            onToggleSetDone={(input: ToggleSetDoneInput) =>
              toggleSetDone.mutate(input)
            }
            onUpdateSetActual={(input: UpdateSetActualInput) =>
              updateSetWeight.mutate(input)
            }
          />
        ))}
      </CardContent>
    </Card>
  );
}
