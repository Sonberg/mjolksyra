"use client";

import { useWorkout } from "@/hooks/useWorkout";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { Card, CardHeader, CardContent } from "../ui/card";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { CheckCircle2Icon, RotateCcwIcon } from "lucide-react";
import { ExerciseType } from "@/lib/exercisePrescription";
import Link from "next/link";
import { WorkoutExerciseCard } from "./workout/WorkoutExerciseCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ToggleExerciseDoneInput,
  ToggleSetDoneInput,
  UpdateSetActualInput,
} from "./workout/types";
import { WorkoutChatPanel } from "@/components/WorkoutChat/WorkoutChatPanel";
import { WorkoutAnalysisSection } from "./workout/WorkoutAnalysisSection";

type Props = {
  workout: PlannedWorkout;
  viewerMode?: "athlete" | "coach";
  isHighlighted?: boolean;
  traineeId?: string;
  isDetailView?: boolean;
  backTab?: "past" | "future" | "changes";
};

export function Workout({
  workout,
  viewerMode = "athlete",
  isHighlighted = false,
  traineeId,
  isDetailView = false,
  backTab,
}: Props) {
  const {
    saveCompletion,
    saveReview,
    toggleExerciseDone,
    toggleSetDone,
    updateSetWeight,
  } = useWorkout({ workout });

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
  const totalExercises = workout.exercises.length;
  const doneExercises = workout.exercises.filter(
    (exercise) => exercise.isDone,
  ).length;
  const totalSets = workout.exercises.reduce(
    (count, exercise) => count + (exercise.prescription?.sets?.length ?? 0),
    0,
  );
  const doneSets = workout.exercises.reduce(
    (count, exercise) =>
      count +
      (exercise.prescription?.sets?.filter((set) => set.actual?.isDone)
        .length ?? 0),
    0,
  );

  const detailHref = traineeId
    ? viewerMode === "coach"
      ? backTab
        ? `/app/coach/athletes/${traineeId}/workouts/${workout.id}?tab=${backTab}`
        : `/app/coach/athletes/${traineeId}/workouts/${workout.id}`
      : backTab
        ? `/app/athlete/${traineeId}/workouts/${workout.id}?tab=${backTab}`
        : `/app/athlete/${traineeId}/workouts/${workout.id}`
    : null;

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
    if (targetType === ExerciseType.DurationSeconds) {
      return `${target?.durationSeconds ?? "-"} s`;
    }

    if (targetType === ExerciseType.DistanceMeters) {
      return `${target?.distanceMeters ?? "-"} m`;
    }

    return `${target?.reps ?? "-"} reps`;
  }

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
          ? "overflow-hidden rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] ring-2 ring-[var(--shell-accent)]/30"
          : "overflow-hidden rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)]"
      }
    >
      <CardHeader className="border-b border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-3 font-semibold text-[var(--shell-ink)] sm:p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="min-w-0 flex gap-4">
            <p className="truncate text-base font-semibold text-[var(--shell-ink)]">
              {displayName}
            </p>
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-ink)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--shell-surface)]">
                  <CheckCircle2Icon className="h-3 w-3" />
                  Completed
                </span>
              ) : null}
              {viewerMode === "coach" && isReviewed ? (
                <span className="inline-flex items-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--shell-ink)]">
                  Reviewed
                </span>
              ) : null}
            </div>
            {viewerMode === "coach" && isCompleted && !isReviewed ? (
              <span className="rounded-none border border-transparent bg-[var(--shell-accent)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--shell-accent-ink)]">
                Needs review
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {!isDetailView && detailHref ? (
              <Link
                href={detailHref}
                className="inline-flex items-center rounded-none border border-[var(--shell-border)] bg-[var(--shell-ink)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--shell-surface)] transition hover:brightness-95"
              >
                {viewerMode === "coach" ? "Open" : "Start session"}
              </Link>
            ) : null}
            {viewerMode === "athlete" && isDetailView ? (
              <button
                type="button"
                disabled={saveCompletion.isPending}
                onClick={() =>
                  saveCompletion.mutate({
                    completedAt: isCompleted ? null : new Date(),
                    markAllExercisesDone: !isCompleted,
                  })
                }
                className="inline-flex items-center rounded-none border border-transparent bg-[var(--shell-accent)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95"
              >
                {isCompleted ? "Mark incomplete" : "Complete workout"}
              </button>
            ) : null}
            {viewerMode === "coach" && isCompleted ? (
              <>
                {!isReviewed ? (
                  <button
                    type="button"
                    disabled={saveReview.isPending}
                    onClick={() =>
                      saveReview.mutate({
                        reviewedAt: new Date(),
                      })
                    }
                    className="rounded-none border border-transparent bg-[var(--shell-accent)] px-3 py-2 text-xs font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
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
                      })
                    }
                    className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:opacity-60"
                  >
                    {saveReview.isPending ? "Saving..." : "Unmark reviewed"}
                  </button>
                )}
              </>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 bg-[var(--shell-surface)] p-3 text-[var(--shell-ink)] sm:space-y-4 sm:p-4">
        {!isDetailView ? (
          <>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--shell-muted)]">
                {totalExercises} exercises
              </span>
              {totalSets > 0 ? (
                <span className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--shell-muted)]">
                  {doneSets}/{totalSets} sets done
                </span>
              ) : null}
              <span className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--shell-muted)]">
                {doneExercises}/{totalExercises} exercises done
              </span>
            </div>

            {workout.note?.trim() ? (
              <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                  Coach note
                </p>
                <p className="mt-1 text-sm text-[var(--shell-ink)]">
                  {workout.note}
                </p>
              </div>
            ) : null}

            <div className="grid gap-2 sm:grid-cols-2">
              {workout.exercises.slice(0, 4).map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                    Exercise {index + 1}
                  </p>
                  <p
                    className={
                      exercise.isDone
                        ? "mt-1 text-sm text-[var(--shell-muted)] line-through"
                        : "mt-1 text-sm text-[var(--shell-ink)]"
                    }
                  >
                    {exercise.name}
                  </p>
                </div>
              ))}
            </div>

            {workout.exercises.length > 4 ? (
              <p className="text-xs text-[var(--shell-muted)]">
                +{workout.exercises.length - 4} more exercise
                {workout.exercises.length - 4 > 1 ? "s" : ""}
              </p>
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
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {viewerMode === "athlete" && isCompleted ? (
                <button
                  type="button"
                  disabled={saveCompletion.isPending}
                  onClick={() =>
                    saveCompletion.mutate({
                      completedAt: null,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:opacity-60"
                >
                  <RotateCcwIcon className="h-3.5 w-3.5" />
                  Mark incomplete
                </button>
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

            {workout.note?.trim() ? (
              <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                  Coach note
                </p>
                <p className="mt-1 text-sm text-[var(--shell-ink)]">
                  {workout.note}
                </p>
              </div>
            ) : null}
            {viewerMode === "coach" && isCompleted ? (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>AI analysis</AccordionTrigger>
                  <AccordionContent>
                    <WorkoutAnalysisSection
                      traineeId={workout.traineeId}
                      plannedWorkoutId={workout.id}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : null}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Chat</AccordionTrigger>
                <AccordionContent>
                  <WorkoutChatPanel
                    traineeId={workout.traineeId}
                    plannedWorkoutId={workout.id}
                    viewerMode={viewerMode}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="grid grid-cols-1 gap-3">
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
