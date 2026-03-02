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
};

export function Workout({
  workout,
  viewerMode = "athlete",
  isHighlighted = false,
  traineeId,
  isDetailView = false,
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
          ? "overflow-hidden border-zinc-400 bg-zinc-900/90 ring-1 ring-zinc-300/50"
          : "overflow-hidden bg-white/10"
      }
    >
      <CardHeader className="over p-3 font-bold sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="truncate">{displayName}</span>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {viewerMode === "athlete" && !isDetailView && traineeId ? (
              <Link
                href={`/app/athlete/${traineeId}/workouts/${workout.id}`}
                className="inline-flex items-center rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-100 transition hover:bg-zinc-800"
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
                className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-black transition hover:bg-zinc-200"
              >
                {isCompleted ? "Edit completion" : "Complete workout"}
              </button>
            ) : null}
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-700/60 bg-emerald-900/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
                  <CheckCircle2Icon className="h-3 w-3" />
                  Completed
                </span>
              ) : null}
              {viewerMode === "coach" && isReviewed ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-200">
                  Reviewed
                </span>
              ) : null}
              {displayName === "Today" ? (
                <div className="h-3 w-3 rounded-full bg-red-700" />
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 rounded-t-lg bg-black p-3 sm:gap-4 sm:p-4">
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
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-900 disabled:opacity-60"
                >
                  <RotateCcwIcon className="h-3.5 w-3.5" />
                  Mark incomplete
                </button>
              ) : null}
              {!isDetailView && isCompleted ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-700/60 bg-emerald-900/30 px-3 py-2 text-xs font-semibold text-emerald-200"
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
                  className="rounded-lg border border-zinc-700 bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
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
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:bg-zinc-800 disabled:opacity-60"
                >
                  {saveReview.isPending ? "Saving..." : "Unmark reviewed"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsReviewing((x) => !x)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-900"
              >
                {isReviewing ? "Hide review details" : "Review details"}
              </button>
            </>
          ) : null}
          {workout.completedAt ? (
            <span className="text-xs text-zinc-500">
              Completed {new Date(workout.completedAt).toLocaleString()}
            </span>
          ) : null}
          {viewerMode === "coach" && workout.reviewedAt ? (
            <span className="text-xs text-zinc-500">
              Reviewed {new Date(workout.reviewedAt).toLocaleString()}
            </span>
          ) : null}
        </div>

        {isDetailView && isLogging ? (
          <div className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Completion note (optional)
              </p>
              <textarea
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                rows={3}
                placeholder="How did it feel? Any notes to your coach?"
                className="mt-2 w-full resize-y rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
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
                className="rounded-lg border border-zinc-700 bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
              >
                {saveCompletion.isPending ? "Saving..." : "Save completion"}
              </button>
              <button
                type="button"
                disabled={saveCompletion.isPending}
                onClick={() => setIsLogging(false)}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {workout.note?.trim() ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Coach note
            </p>
            <p className="mt-1 text-sm text-zinc-200">{workout.note}</p>
          </div>
        ) : null}
        {(isDetailView || viewerMode === "coach") &&
        workout.completionNote?.trim() ? (
          <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/20 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300/80">
              {viewerMode === "coach" ? "Athlete log" : "Your log"}
            </p>
            <p className="mt-1 text-sm text-zinc-100">
              {workout.completionNote}
            </p>
          </div>
        ) : null}
        {viewerMode === "coach" &&
        isReviewing &&
        !workout.completionNote?.trim() ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-400">
            Athlete completed this workout without a completion note.
          </div>
        ) : null}
        {viewerMode === "coach" && isReviewing ? (
          <div className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Coach log
              </p>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                placeholder="Feedback for the athlete, notes for follow-up, or coaching observations."
                className="mt-2 w-full resize-y rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
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
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {saveReview.isPending ? "Saving..." : "Save coach log"}
              </button>
            </div>
          </div>
        ) : null}
        {viewerMode === "coach" &&
        workout.reviewNote?.trim() &&
        !isReviewing ? (
          <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/70 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Coach log
            </p>
            <p className="mt-1 text-sm text-zinc-100">{workout.reviewNote}</p>
          </div>
        ) : null}
        {viewerMode === "athlete" && workout.reviewNote?.trim() ? (
          <div className="rounded-lg border border-blue-900/60 bg-blue-950/20 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-300/80">
              Coach feedback
            </p>
            <p className="mt-1 text-sm text-zinc-100">{workout.reviewNote}</p>
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
