"use client";

import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { startWorkoutSession } from "@/services/completedWorkouts/startWorkoutSession";
import { StatusBadge } from "./StatusBadge";
import { CheckCircle2Icon, PlayIcon } from "lucide-react";

type Props = {
  workout: PlannedWorkout;
  viewerMode?: "athlete" | "coach";
  isHighlighted?: boolean;
  traineeId?: string;
  backTab?: "planned" | "completed";
};

export function WorkoutCard({
  workout,
  viewerMode = "athlete",
  isHighlighted = false,
  traineeId,
  backTab,
}: Props) {
  const router = useRouter();

  const startSessionMutation = useMutation({
    mutationFn: () =>
      startWorkoutSession({
        traineeId: traineeId!,
        plannedWorkoutId: workout.id,
      }),
    onSuccess: (created) => {
      router.push(`/app/athlete/${traineeId}/workouts/${created.id}?tab=completed`);
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

  const exercises = workout.publishedExercises;
  const isStarted = !!workout.hasActiveSession && !workout.skippedAt;
  const totalExercises = exercises.length;
  const doneExercises = exercises.filter(
    (exercise) => exercise.isDone,
  ).length;
  const totalSets = exercises.reduce(
    (count, exercise) => count + (exercise.prescription?.sets?.length ?? 0),
    0,
  );
  const doneSets = exercises.reduce(
    (count, exercise) =>
      count +
      (exercise.prescription?.sets?.filter((set) => set.actual?.isDone)
        .length ?? 0),
    0,
  );

  const coachDetailHref = traineeId
    ? backTab
      ? `/app/coach/athletes/${traineeId}/workouts/planned/${workout.id}?tab=${backTab}`
      : `/app/coach/athletes/${traineeId}/workouts/planned/${workout.id}`
    : null;

  useEffect(() => {
    if (!isHighlighted) {
      return;
    }

    const element = document.getElementById(`workout-${workout.id}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isHighlighted, workout.id]);

  return (
    <article
      id={`workout-${workout.id}`}
      data-today={displayName === "Today"}
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
              <StatusBadge variant={isStarted ? "accent" : "subtle"}>
                {isStarted ? "In progress" : "Planned"}
              </StatusBadge>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {viewerMode === "coach" && coachDetailHref ? (
              <Link
                href={coachDetailHref}
                className="inline-flex items-center rounded-none border border-[var(--shell-border)] bg-[var(--shell-ink)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--shell-surface)] transition hover:brightness-95"
              >
                Open
              </Link>
            ) : viewerMode === "athlete" && traineeId ? (
              <button
                type="button"
                onClick={() => startSessionMutation.mutate()}
                disabled={startSessionMutation.isPending}
                className="inline-flex items-center rounded-none border border-transparent bg-[var(--shell-accent)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
              >
                {isStarted ? <CheckCircle2Icon className="mr-1.5 h-3.5 w-3.5" /> : <PlayIcon className="mr-1.5 h-3.5 w-3.5" />}
                {startSessionMutation.isPending
                  ? (isStarted ? "Opening..." : "Starting...")
                  : (isStarted ? "Open session" : "Start session")}
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 bg-[var(--shell-surface)] p-3 text-[var(--shell-ink)] sm:gap-4 sm:p-4">
        <>
          <div className="flex flex-wrap items-baseline gap-2">
            <StatusBadge variant="subtle">{totalExercises} exercises</StatusBadge>
            {totalSets > 0 ? (
              <StatusBadge variant="subtle">{doneSets}/{totalSets} sets done</StatusBadge>
            ) : null}
            <StatusBadge variant="subtle">{doneExercises}/{totalExercises} exercises done</StatusBadge>
          </div>

          {workout.note?.trim() ? (
            <div className="border-l-2 border-[var(--shell-accent)] pl-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                Coach note
              </p>
              <p className="mt-1 text-sm text-[var(--shell-ink)]">
                {workout.note}
              </p>
            </div>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            {exercises.slice(0, 4).map((exercise, index) => (
              <div
                key={exercise.id}
                className="bg-[var(--shell-surface-strong)] px-3 py-2"
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

          {exercises.length > 4 ? (
            <p className="text-xs text-[var(--shell-muted)]">
              +{exercises.length - 4} more exercise
              {exercises.length - 4 > 1 ? "s" : ""}
            </p>
          ) : null}
        </>
      </div>
    </article>
  );
}
