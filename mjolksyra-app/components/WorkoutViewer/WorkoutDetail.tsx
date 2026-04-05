import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import dayjs from "dayjs";
import { useMemo } from "react";
import { CheckCircle2Icon, SparklesIcon } from "lucide-react";
import { ExerciseType } from "@/lib/exercisePrescription";
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
import { WorkoutAnalysisSection, WorkoutAnalysisTrigger } from "./workout/WorkoutAnalysisSection";
import { StatusBadge } from "./StatusBadge";
import { useWorkout } from "@/hooks/useWorkout";

type Props = {
  workout: PlannedWorkout;
  viewerMode?: "athlete" | "coach";
  traineeId: string;
  backTab?: "past" | "future" | "changes";
};

export function WorkoutDetail({
  workout,
  viewerMode = "athlete",
  traineeId,
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

  return (
    <article
      id={`workout-${workout.id}`}
      data-today={displayName === "Today"}
      className="flex h-full flex-col overflow-hidden bg-[var(--shell-surface)]"
    >
      {/* Header — non-scrolling */}
      <div className="flex-none border-b border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-3 font-semibold text-[var(--shell-ink)] sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2">
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
            <p className="truncate text-base font-semibold text-[var(--shell-ink)]">
              {displayName}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isCompleted ? (
              <StatusBadge variant="default">
                <CheckCircle2Icon className="h-3 w-3" />
                Completed
              </StatusBadge>
            ) : null}
            {viewerMode === "coach" && isReviewed ? (
              <StatusBadge variant="solid">Reviewed</StatusBadge>
            ) : null}
            {viewerMode === "athlete" && (
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
            )}

            {viewerMode === "coach" && isCompleted ? (
              !isReviewed ? (
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
              )
            ) : null}
          </div>
        </div>
      </div>

      {/* Body — two independently scrolling panels */}
      <div className="flex flex-1 min-h-0 flex-col md:flex-row overflow-hidden">
        {/* Left panel: exercises + AI analysis */}
        <div className="min-h-0 flex-[2] overflow-y-auto overscroll-contain space-y-4 p-4 md:border-r md:border-[var(--shell-border)]">
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
          {viewerMode === "coach" && isCompleted ? (
            <Accordion type="single" collapsible className="-mx-4 w-[calc(100%+2rem)]">
              <AccordionItem value="item-1">
                <AccordionTrigger className="px-4">
                  <span className="flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4 text-[var(--shell-accent)]" />
                    AI analysis
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 px-4">
                  <WorkoutAnalysisSection
                    traineeId={workout.traineeId}
                    plannedWorkoutId={workout.id}
                  />
                  <WorkoutAnalysisTrigger
                    traineeId={workout.traineeId}
                    plannedWorkoutId={workout.id}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}
          <div className="grid grid-cols-1 gap-3">
            {workout.exercises.map((exercise, index) => (
              <WorkoutExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                viewerMode={viewerMode}
                isDetailView
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
        </div>

        {/* Right panel: chat */}
        <div className="min-h-0 flex-1 flex flex-col border-t border-[var(--shell-border)] md:border-t-0 overflow-hidden">
          <WorkoutChatPanel
            traineeId={workout.traineeId}
            plannedWorkoutId={workout.id}
            viewerMode={viewerMode}
          />
        </div>
      </div>
    </article>
  );
}
