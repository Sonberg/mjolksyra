"use client";

import { CompletedWorkout } from "@/services/completedWorkouts/type";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";

type Props = {
  workout: CompletedWorkout;
  viewerMode?: "athlete" | "coach";
  isHighlighted?: boolean;
  traineeId?: string;
  backTab?: "planned" | "completed";
};

export function CompletedWorkoutCard({
  workout,
  viewerMode = "athlete",
  isHighlighted = false,
  traineeId,
  backTab,
}: Props) {
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

  const totalExercises = workout.exercises.length;
  const totalSets = workout.exercises.reduce(
    (count, exercise) => count + (exercise.prescription?.sets?.length ?? 0),
    0,
  );
  const doneSets = workout.exercises.reduce(
    (count, exercise) =>
      count + (exercise.prescription?.sets?.filter((set) => set.actual?.isDone).length ?? 0),
    0,
  );
  const hasEnteredData = workout.exercises.some(
    (ex) => ex.isDone || (ex.prescription?.sets?.some((s) => s.actual?.isDone) ?? false),
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

  useEffect(() => {
    if (!isHighlighted) {
      return;
    }

    const element = document.getElementById(`completed-workout-${workout.id}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isHighlighted, workout.id]);

  return (
    <article
      id={`completed-workout-${workout.id}`}
      className={
        isHighlighted
          ? "overflow-hidden border border-[var(--shell-border)] bg-[var(--shell-surface)] ring-2 ring-[var(--shell-accent)]/30"
          : "overflow-hidden border border-[var(--shell-border)] bg-[var(--shell-surface)]"
      }
    >
      <div className="border-b border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-3 font-semibold text-[var(--shell-ink)] sm:p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="min-w-0 flex gap-4">
            <p className="truncate text-base font-semibold text-[var(--shell-ink)]">
              {displayName}
            </p>
            <div className="flex items-center gap-2">
              <StatusBadge
                variant={
                  workout.skippedAt || (!workout.completedAt && !hasEnteredData)
                    ? "subtle"
                    : "default"
                }
              >
                {workout.skippedAt
                  ? "Skipped"
                  : workout.completedAt
                    ? "Completed"
                    : hasEnteredData
                      ? "In progress"
                      : "Not started"}
              </StatusBadge>
            </div>
          </div>
          {detailHref && !workout.skippedAt ? (
            <Link
              href={detailHref}
              className="inline-flex items-center border border-[var(--shell-border)] bg-[var(--shell-ink)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--shell-surface)] transition hover:brightness-95"
            >
              Open
            </Link>
          ) : null}
        </div>
      </div>
      {!workout.skippedAt ? (
        <div className="space-y-3 bg-[var(--shell-surface)] p-3 text-[var(--shell-ink)] sm:space-y-4 sm:p-4">
          <div className="flex flex-wrap items-baseline gap-2">
            <StatusBadge variant="subtle">{totalExercises} exercises</StatusBadge>
            {totalSets > 0 ? (
              <StatusBadge variant="subtle">{doneSets}/{totalSets} sets done</StatusBadge>
            ) : null}
            {workout.completedAt ? (
              <StatusBadge variant="subtle">
                {new Date(workout.completedAt).toLocaleString()}
              </StatusBadge>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {workout.exercises.slice(0, 4).map((exercise, index) => (
              <div
                key={exercise.id}
                className="bg-[var(--shell-surface-strong)] px-3 py-2"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                  Exercise {index + 1}
                </p>
                <p className="mt-1 text-sm text-[var(--shell-ink)]">
                  {exercise.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
