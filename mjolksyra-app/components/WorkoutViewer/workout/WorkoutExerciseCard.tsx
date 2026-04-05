import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import {
  ExerciseType,
  formatPrescription,
} from "@/lib/exercisePrescription";
import { WorkoutExerciseSetCard } from "./WorkoutExerciseSetCard";
import {
  GetSetTargetLabel,
  ToggleExerciseDoneInput,
  ToggleSetDoneInput,
  UpdateSetActualInput,
  WorkoutExercise,
} from "./types";

type Props = {
  exercise: WorkoutExercise;
  index: number;
  viewerMode: "athlete" | "coach";
  isDetailView: boolean;
  isToggleExerciseDonePending: boolean;
  isSetActionPending: boolean;
  getSetTargetLabel: GetSetTargetLabel;
  onToggleExerciseDone: (input: ToggleExerciseDoneInput) => void;
  onToggleSetDone: (input: ToggleSetDoneInput) => void;
  onUpdateSetActual: (input: UpdateSetActualInput) => void;
};

export function WorkoutExerciseCard({
  exercise,
  index,
  viewerMode,
  isDetailView,
  isToggleExerciseDonePending,
  isSetActionPending,
  getSetTargetLabel,
  onToggleExerciseDone,
  onToggleSetDone,
  onUpdateSetActual,
}: Props) {
  return (
    <div className="bg-[var(--shell-surface-strong)]">
      {/* Exercise header row */}
      <div className="flex items-start gap-3 p-3 sm:items-center sm:gap-4 sm:p-4">
        <div className="grid h-7 w-7 shrink-0 place-items-center bg-[var(--shell-accent)] text-xs font-bold text-[var(--shell-accent-ink)]">
          {index + 1}
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={
                exercise.isDone
                  ? "text-sm font-semibold text-[var(--shell-muted)] line-through"
                  : "text-sm font-semibold text-[var(--shell-ink)]"
              }
            >
              {exercise.name}
            </p>
            {formatPrescription(exercise.prescription) ? (
              <p className="mt-0.5 text-xs text-[var(--shell-muted)]">
                {formatPrescription(exercise.prescription)}
              </p>
            ) : null}
          </div>
          {viewerMode === "athlete" && isDetailView ? (
            <button
              type="button"
              disabled={isToggleExerciseDonePending}
              onClick={() =>
                onToggleExerciseDone({
                  exerciseId: exercise.id,
                  isDone: !(exercise.isDone ?? false),
                })
              }
              className={
                exercise.isDone
                  ? "inline-flex items-center gap-1.5 border border-transparent bg-[var(--shell-accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)] transition disabled:opacity-60"
                  : "inline-flex items-center gap-1.5 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)] disabled:opacity-60"
              }
              title={exercise.isDone ? "Undo done" : "Mark done"}
            >
              {exercise.isDone ? (
                <CheckCircle2Icon className="h-3 w-3" />
              ) : (
                <CircleIcon className="h-3 w-3" />
              )}
              {exercise.isDone ? "Done" : "Mark done"}
            </button>
          ) : exercise.isDone ? (
            <span className="inline-flex items-center gap-1.5 border border-transparent bg-[var(--shell-accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)]">
              <CheckCircle2Icon className="h-3 w-3" />
              Done
            </span>
          ) : null}
        </div>
      </div>

      {/* Exercise note */}
      {exercise.note?.trim() ? (
        <div className="mx-3 mb-3 border-l-2 border-[var(--shell-accent)] pl-3 sm:mx-4 sm:mb-4">
          <p className="text-xs text-[var(--shell-muted)]">{exercise.note}</p>
        </div>
      ) : null}

      {/* Set details */}
      {isDetailView && exercise.prescription?.sets?.length ? (
        <div className="border-t border-[var(--shell-border)]">
          <div className="px-3 py-2 sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
              Sets
            </p>
          </div>
          <div className="divide-y divide-[var(--shell-border)]">
            {exercise.prescription.sets.map((set, setIndex) => (
              <WorkoutExerciseSetCard
                key={`${exercise.id}-set-target-${setIndex}-${set.actual?.reps ?? ""}-${set.actual?.weightKg ?? ""}-${set.actual?.durationSeconds ?? ""}-${set.actual?.distanceMeters ?? ""}-${set.actual?.note ?? ""}-${set.actual?.isDone ? "done" : "todo"}`}
                exerciseId={exercise.id}
                set={set}
                setIndex={setIndex}
                targetType={
                  exercise.prescription?.type as ExerciseType | undefined
                }
                isEditable={viewerMode === "athlete"}
                isPending={isSetActionPending}
                getSetTargetLabel={getSetTargetLabel}
                onToggleSetDone={onToggleSetDone}
                onUpdateSetActual={onUpdateSetActual}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
