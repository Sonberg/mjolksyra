import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import { ExerciseType } from "@/lib/exercisePrescription";
import {
  GetSetTargetLabel,
  ToggleSetDoneInput,
  UpdateSetActualInput,
  WorkoutSet,
} from "./types";

type Props = {
  exerciseId: string;
  set: WorkoutSet;
  setIndex: number;
  targetType: ExerciseType | undefined;
  isEditable: boolean;
  isPending: boolean;
  getSetTargetLabel: GetSetTargetLabel;
  onToggleSetDone: (input: ToggleSetDoneInput) => void;
  onUpdateSetActual: (input: UpdateSetActualInput) => void;
};

function parseNullableNumber(rawValue: string): number | null | "invalid" {
  const value = rawValue.trim();
  if (value.length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? "invalid" : parsed;
}

export function WorkoutExerciseSetCard({
  exerciseId,
  set,
  setIndex,
  targetType,
  isEditable,
  isPending,
  getSetTargetLabel,
  onToggleSetDone,
  onUpdateSetActual,
}: Props) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-2 sm:px-2.5">
      <div className="min-w-0">
        <div
          className={
            set.actual?.isDone
              ? "text-sm font-semibold text-[var(--shell-muted)] line-through"
              : "text-sm font-semibold text-[var(--shell-ink)]"
          }
        >
          Set {setIndex + 1}: {getSetTargetLabel(targetType, set.target)}
        </div>
        {set.target?.note?.trim() ? (
          <div className="mt-1 text-xs text-[var(--shell-muted)]">{set.target.note}</div>
        ) : null}
        <div className="mt-2 flex items-center gap-3 text-xs text-[var(--shell-muted)]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]">
            Target
          </span>
          <span>
            {targetType === ExerciseType.SetsReps
              ? `${set.target?.reps ?? "-"} reps`
              : targetType === ExerciseType.DurationSeconds
                ? `${set.target?.durationSeconds ?? "-"} s`
                : `${set.target?.distanceMeters ?? "-"} m`}
          </span>
          {targetType === ExerciseType.SetsReps &&
          typeof set.target?.weightKg === "number" ? (
            <>
              <span className="text-[var(--shell-muted)]">•</span>
              <span>{set.target.weightKg} kg</span>
            </>
          ) : null}
        </div>
        <div className="mt-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]">
            Actual
          </span>
          {isEditable ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {targetType === ExerciseType.SetsReps ? (
                <div className="relative">
                  <input
                    key={`${exerciseId}-${setIndex}-reps-${set.actual?.reps ?? set.target?.reps ?? "none"}`}
                    type="number"
                    min={0}
                    defaultValue={set.actual?.reps ?? set.target?.reps ?? ""}
                    onBlur={(ev) => {
                      const nextReps = parseNullableNumber(ev.target.value);
                      if (nextReps === "invalid") {
                        return;
                      }

                      const currentReps = set.actual?.reps ?? null;
                      if (currentReps === nextReps) {
                        return;
                      }

                      onUpdateSetActual({
                        exerciseId,
                        setIndex,
                        weightKg: set.actual?.weightKg ?? null,
                        reps: nextReps,
                        durationSeconds: set.actual?.durationSeconds ?? null,
                        distanceMeters: set.actual?.distanceMeters ?? null,
                        note: set.actual?.note ?? null,
                      });
                    }}
                    className="h-8 w-24 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-10 text-xs text-[var(--shell-ink)]"
                    aria-label={`Actual reps for set ${setIndex + 1}`}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--shell-muted)]">
                    reps
                  </span>
                </div>
              ) : null}
              {targetType === ExerciseType.DurationSeconds ? (
                <div className="relative">
                  <input
                    key={`${exerciseId}-${setIndex}-duration-${set.actual?.durationSeconds ?? set.target?.durationSeconds ?? "none"}`}
                    type="number"
                    min={0}
                    defaultValue={
                      set.actual?.durationSeconds ?? set.target?.durationSeconds ?? ""
                    }
                    onBlur={(ev) => {
                      const nextDuration = parseNullableNumber(ev.target.value);
                      if (nextDuration === "invalid") {
                        return;
                      }

                      const currentDuration = set.actual?.durationSeconds ?? null;
                      if (currentDuration === nextDuration) {
                        return;
                      }

                      onUpdateSetActual({
                        exerciseId,
                        setIndex,
                        weightKg: set.actual?.weightKg ?? null,
                        reps: set.actual?.reps ?? null,
                        durationSeconds: nextDuration,
                        distanceMeters: set.actual?.distanceMeters ?? null,
                        note: set.actual?.note ?? null,
                      });
                    }}
                    className="h-8 w-24 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-7 text-xs text-[var(--shell-ink)]"
                    aria-label={`Actual duration for set ${setIndex + 1}`}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--shell-muted)]">
                    s
                  </span>
                </div>
              ) : null}
              {targetType === ExerciseType.DistanceMeters ? (
                <div className="relative">
                  <input
                    key={`${exerciseId}-${setIndex}-distance-${set.actual?.distanceMeters ?? set.target?.distanceMeters ?? "none"}`}
                    type="number"
                    min={0}
                    defaultValue={
                      set.actual?.distanceMeters ?? set.target?.distanceMeters ?? ""
                    }
                    onBlur={(ev) => {
                      const nextDistance = parseNullableNumber(ev.target.value);
                      if (nextDistance === "invalid") {
                        return;
                      }

                      const currentDistance = set.actual?.distanceMeters ?? null;
                      if (currentDistance === nextDistance) {
                        return;
                      }

                      onUpdateSetActual({
                        exerciseId,
                        setIndex,
                        weightKg: set.actual?.weightKg ?? null,
                        reps: set.actual?.reps ?? null,
                        durationSeconds: set.actual?.durationSeconds ?? null,
                        distanceMeters: nextDistance,
                        note: set.actual?.note ?? null,
                      });
                    }}
                    className="h-8 w-24 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-7 text-xs text-[var(--shell-ink)]"
                    aria-label={`Actual distance for set ${setIndex + 1}`}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--shell-muted)]">
                    m
                  </span>
                </div>
              ) : null}
              {targetType === ExerciseType.SetsReps ? (
                <div className="relative">
                  <input
                    key={`${exerciseId}-${setIndex}-${set.actual?.weightKg ?? "none"}-${set.target?.weightKg ?? "none"}`}
                    type="number"
                    min={0}
                    step="0.5"
                    defaultValue={set.actual?.weightKg ?? set.target?.weightKg ?? ""}
                    onBlur={(ev) => {
                      const nextWeight = parseNullableNumber(ev.target.value);
                      if (nextWeight === "invalid") {
                        return;
                      }

                      const currentWeight = set.actual?.weightKg ?? null;
                      if (currentWeight === nextWeight) {
                        return;
                      }

                      onUpdateSetActual({
                        exerciseId,
                        setIndex,
                        weightKg: nextWeight,
                        reps: set.actual?.reps ?? null,
                        durationSeconds: set.actual?.durationSeconds ?? null,
                        distanceMeters: set.actual?.distanceMeters ?? null,
                        note: set.actual?.note ?? null,
                      });
                    }}
                    className="h-8 w-24 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-7 text-xs text-[var(--shell-ink)]"
                    aria-label={`Actual weight for set ${setIndex + 1}`}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--shell-muted)]">
                    kg
                  </span>
                </div>
              ) : null}
              <input
                key={`${exerciseId}-${setIndex}-note-${set.actual?.note ?? "none"}`}
                type="text"
                defaultValue={set.actual?.note ?? ""}
                onBlur={(ev) => {
                  const nextNote = ev.target.value.trim().length
                    ? ev.target.value.trim()
                    : null;
                  const currentNote = set.actual?.note ?? null;
                  if (currentNote === nextNote) {
                    return;
                  }

                  onUpdateSetActual({
                    exerciseId,
                    setIndex,
                    weightKg: set.actual?.weightKg ?? null,
                    reps: set.actual?.reps ?? null,
                    durationSeconds: set.actual?.durationSeconds ?? null,
                    distanceMeters: set.actual?.distanceMeters ?? null,
                    note: nextNote,
                  });
                }}
                className="h-8 min-w-[180px] flex-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1 text-xs text-[var(--shell-ink)]"
                placeholder="Set note (actual)"
                aria-label={`Actual note for set ${setIndex + 1}`}
              />
            </div>
          ) : (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--shell-ink)]">
              <span>
                {targetType === ExerciseType.SetsReps
                  ? `${set.actual?.reps ?? "-"} reps`
                  : targetType === ExerciseType.DurationSeconds
                    ? `${set.actual?.durationSeconds ?? "-"} s`
                    : `${set.actual?.distanceMeters ?? "-"} m`}
              </span>
              {targetType === ExerciseType.SetsReps ? (
                <>
                  <span className="text-[var(--shell-muted)]">•</span>
                  <span>{set.actual?.weightKg ?? "-"} kg</span>
                </>
              ) : null}
              {set.actual?.note?.trim() ? (
                <>
                  <span className="text-[var(--shell-muted)]">•</span>
                  <span className="text-[var(--shell-muted)]">{set.actual.note}</span>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
      {isEditable ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            onToggleSetDone({
              exerciseId,
              setIndex,
            })
          }
          className={
            set.actual?.isDone
              ? "inline-flex items-center justify-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-ink)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-surface)] transition disabled:opacity-60"
              : "inline-flex items-center justify-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface-strong)] disabled:opacity-60"
          }
          title={set.actual?.isDone ? "Mark set incomplete" : "Mark set done"}
        >
          {set.actual?.isDone ? (
            <CheckCircle2Icon className="h-3.5 w-3.5" />
          ) : (
            <CircleIcon className="h-3.5 w-3.5" />
          )}
          {set.actual?.isDone ? "Done" : "Mark done"}
        </button>
      ) : (
        <span
          className={
            set.actual?.isDone
              ? "inline-flex items-center justify-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-ink)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-surface)]"
              : "inline-flex items-center justify-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-ink)]"
          }
        >
          {set.actual?.isDone ? "Done" : "Not done"}
        </span>
      )}
    </div>
  );
}
