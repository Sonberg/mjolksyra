import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import {
  ExerciseType,
  formatPrescription,
} from "@/lib/exercisePrescription";
import { AthleteSetRow } from "./AthleteSetRow";
import {
  ToggleExerciseDoneInput,
  ToggleSetDoneInput,
  UpdateSetActualInput,
  WorkoutExercise,
} from "@/components/WorkoutViewer/workout/types";

type Props = {
  exercise: WorkoutExercise;
  index: number;
  isToggleExerciseDonePending: boolean;
  isSetActionPending: boolean;
  onToggleExerciseDone: (input: ToggleExerciseDoneInput) => void;
  onToggleSetDone: (input: ToggleSetDoneInput) => void;
  onUpdateSetActual: (input: UpdateSetActualInput) => void;
};

export function AthleteExerciseCard({
  exercise,
  index,
  isToggleExerciseDonePending,
  isSetActionPending,
  onToggleExerciseDone,
  onToggleSetDone,
  onUpdateSetActual,
}: Props) {
  const sets = exercise.prescription?.sets ?? [];
  const doneSets = sets.filter((s) => s.actual?.isDone).length;
  const totalSets = sets.length;
  const prescription = formatPrescription(exercise.prescription);

  return (
    <div className="border border-[var(--shell-border)] bg-[var(--shell-surface)]">
      <div className="flex items-center gap-3 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center border border-[var(--shell-border)] bg-[var(--shell-accent)] text-base font-bold text-[var(--shell-accent-ink)]">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`text-base font-bold ${
              exercise.isDone
                ? "text-[var(--shell-muted)] line-through"
                : "text-[var(--shell-ink)]"
            }`}
          >
            {exercise.name}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            {prescription ? (
              <span className="text-xs text-[var(--shell-muted)]">
                Target: {prescription}
              </span>
            ) : null}
            {totalSets > 0 ? (
              <span className="text-xs font-semibold text-[var(--shell-muted)]">
                {doneSets}/{totalSets} sets done
              </span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          disabled={isToggleExerciseDonePending}
          onClick={() =>
            onToggleExerciseDone({
              exerciseId: exercise.id,
              isDone: !(exercise.isDone ?? false),
            })
          }
          className={`inline-flex shrink-0 items-center gap-1.5 border border-[var(--shell-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition disabled:opacity-60 ${
            exercise.isDone
              ? "bg-[var(--shell-ink)] text-[var(--shell-surface)]"
              : "bg-[var(--shell-surface-strong)] text-[var(--shell-ink)] hover:brightness-95"
          }`}
        >
          {exercise.isDone ? (
            <CheckCircle2Icon className="h-3.5 w-3.5" />
          ) : (
            <CircleIcon className="h-3.5 w-3.5" />
          )}
          {exercise.isDone ? "Done" : "Mark done"}
        </button>
      </div>

      {exercise.note?.trim() ? (
        <div className="mx-4 mb-3 border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-sm text-[var(--shell-muted)]">
          {exercise.note}
        </div>
      ) : null}

      {sets.length > 0 ? (
        <div>
          {sets.map((set, setIndex) => (
            <AthleteSetRow
              key={`${exercise.id}-set-${setIndex}`}
              exerciseId={exercise.id}
              set={set}
              setIndex={setIndex}
              targetType={
                exercise.prescription?.type as
                  | ExerciseType
                  | undefined
              }
              isPending={isSetActionPending}
              onToggleSetDone={onToggleSetDone}
              onUpdateSetActual={onUpdateSetActual}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
