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
    <div className="grid gap-2 border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-3 sm:p-4">
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <div className="grid h-8 w-8 place-items-center rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-accent)] font-bold text-[var(--shell-accent-ink)]">
          {index + 1}
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <div
              className={
                exercise.isDone
                  ? "text-sm font-bold text-[var(--shell-muted)] line-through"
                  : "text-sm font-bold text-[var(--shell-ink)]"
              }
            >
              {exercise.name}
            </div>
            {formatPrescription(exercise.prescription) ? (
              <div className="text-xs text-[var(--shell-muted)]">
                Target: {formatPrescription(exercise.prescription)}
              </div>
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
                  ? "inline-flex items-center gap-1 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-ink)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-surface)] transition disabled:opacity-60"
                  : "inline-flex items-center gap-1 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:opacity-60"
              }
              title={exercise.isDone ? "Undo done" : "Mark done"}
            >
              {exercise.isDone ? (
                <CheckCircle2Icon className="h-3.5 w-3.5" />
              ) : (
                <CircleIcon className="h-3.5 w-3.5" />
              )}
              {exercise.isDone ? "Done" : "Mark done"}
            </button>
          ) : exercise.isDone ? (
            <span className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-ink)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-surface)]">
              Done
            </span>
          ) : null}
        </div>
      </div>
      {exercise.note?.trim() ? (
        <div className="ml-0 border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-xs text-[var(--shell-muted)] sm:ml-12">
          {exercise.note}
        </div>
      ) : null}
      {isDetailView && exercise.prescription?.sets?.length ? (
        <div className="ml-0 grid gap-2 sm:ml-12">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
            Set details
          </div>
          {exercise.prescription.sets.map((set, setIndex) => (
            <WorkoutExerciseSetCard
              key={`${exercise.id}-set-target-${setIndex}`}
              exerciseId={exercise.id}
              set={set}
              setIndex={setIndex}
              targetType={
                exercise.prescription?.type as
                  | ExerciseType
                  | undefined
              }
              isEditable={viewerMode === "athlete"}
              isPending={isSetActionPending}
              getSetTargetLabel={getSetTargetLabel}
              onToggleSetDone={onToggleSetDone}
              onUpdateSetActual={onUpdateSetActual}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
