import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import {
  ExercisePrescriptionTargetType,
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
    <div className="grid gap-2">
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <div className="bg-accent font-bold h-8 w-8 grid place-items-center rounded">
          {index + 1}
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <div
              className={
                exercise.isDone
                  ? "font-bold text-sm text-zinc-500 line-through"
                  : "font-bold text-sm"
              }
            >
              {exercise.name}
            </div>
            {formatPrescription(exercise.prescription) ? (
              <div className="text-xs text-zinc-400">
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
                  ? "inline-flex items-center gap-1 rounded-full border border-emerald-700/60 bg-emerald-900/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-200 transition hover:bg-emerald-900/45 disabled:opacity-60"
                  : "inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-60"
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
            <span className="rounded border border-emerald-700/60 bg-emerald-900/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-200">
              Done
            </span>
          ) : null}
        </div>
      </div>
      {exercise.note?.trim() ? (
        <div className="ml-0 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 sm:ml-12">
          {exercise.note}
        </div>
      ) : null}
      {viewerMode === "athlete" &&
      isDetailView &&
      exercise.prescription?.sets?.length ? (
        <div className="ml-0 grid gap-2 rounded-md border border-zinc-800 bg-zinc-950 p-2.5 sm:ml-12 sm:p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Prescribed sets
          </div>
          {exercise.prescription.sets.map((set, setIndex) => (
            <WorkoutExerciseSetCard
              key={`${exercise.id}-set-target-${setIndex}`}
              exerciseId={exercise.id}
              set={set}
              setIndex={setIndex}
              targetType={
                exercise.prescription?.targetType as
                  | ExercisePrescriptionTargetType
                  | undefined
              }
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

