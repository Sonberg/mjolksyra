"use client";

import { CheckCircle2Icon } from "lucide-react";
import { ExerciseType } from "@/lib/exercisePrescription";
import {
  ToggleSetDoneInput,
  UpdateSetActualInput,
  WorkoutSet,
} from "@/components/WorkoutViewer/workout/types";

type Props = {
  exerciseId: string;
  set: WorkoutSet;
  setIndex: number;
  targetType: ExerciseType | undefined;
  isPending: boolean;
  onToggleSetDone: (input: ToggleSetDoneInput) => void;
  onUpdateSetActual: (input: UpdateSetActualInput) => void;
};

function parseNullableNumber(rawValue: string): number | null | "invalid" {
  const value = rawValue.trim();
  if (value.length === 0) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? "invalid" : parsed;
}

export function AthleteSetRow({
  exerciseId,
  set,
  setIndex,
  targetType,
  isPending,
  onToggleSetDone,
  onUpdateSetActual,
}: Props) {
  const isDone = set.actual?.isDone ?? false;
  const isSetsReps = targetType === ExerciseType.SetsReps;
  const isDuration = targetType === ExerciseType.DurationSeconds;

  const targetParts: string[] = [];
  if (isSetsReps) {
    if (set.target?.reps != null) targetParts.push(`${set.target.reps} reps`);
    if (set.target?.weightKg != null) targetParts.push(`${set.target.weightKg} kg`);
  } else if (isDuration) {
    if (set.target?.durationSeconds != null)
      targetParts.push(`${set.target.durationSeconds} s`);
  } else {
    if (set.target?.distanceMeters != null)
      targetParts.push(`${set.target.distanceMeters} m`);
  }
  const targetSummary = targetParts.join(" · ");

  return (
    <div
      className={`border-t border-[var(--shell-border)] px-4 py-4 transition-colors ${
        isDone ? "bg-[var(--shell-surface-strong)]" : "bg-[var(--shell-surface)]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
          Set {setIndex + 1}
        </span>
        {targetSummary ? (
          <span
            className={`text-xs text-[var(--shell-muted)] ${isDone ? "opacity-50" : ""}`}
          >
            target: {targetSummary}
          </span>
        ) : null}
      </div>

      <div
        className={`${isSetsReps ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"} ${isDone ? "opacity-50" : ""}`}
      >
        {isSetsReps ? (
          <>
            <div className="flex h-14 flex-col justify-between border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                Reps
              </span>
              <div className="relative flex items-center">
                <input
                  key={`${exerciseId}-${setIndex}-reps-${set.actual?.reps ?? set.target?.reps ?? "none"}`}
                  type="number"
                  min={0}
                  defaultValue={set.actual?.reps ?? set.target?.reps ?? ""}
                  onBlur={(ev) => {
                    const next = parseNullableNumber(ev.target.value);
                    if (next === "invalid") return;
                    if ((set.actual?.reps ?? null) === next) return;
                    onUpdateSetActual({
                      exerciseId,
                      setIndex,
                      reps: next,
                      weightKg: set.actual?.weightKg ?? null,
                      durationSeconds: set.actual?.durationSeconds ?? null,
                      distanceMeters: set.actual?.distanceMeters ?? null,
                      note: set.actual?.note ?? null,
                    });
                  }}
                  className="w-full bg-transparent pr-12 text-lg font-bold text-[var(--shell-ink)] outline-none"
                  aria-label={`Actual reps for set ${setIndex + 1}`}
                />
                <span className="pointer-events-none absolute right-0 text-xs text-[var(--shell-muted)]">
                  reps
                </span>
              </div>
            </div>

            <div className="flex h-14 flex-col justify-between border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                Weight
              </span>
              <div className="relative flex items-center">
                <input
                  key={`${exerciseId}-${setIndex}-weight-${set.actual?.weightKg ?? set.target?.weightKg ?? "none"}`}
                  type="number"
                  min={0}
                  step="0.5"
                  defaultValue={set.actual?.weightKg ?? set.target?.weightKg ?? ""}
                  onBlur={(ev) => {
                    const next = parseNullableNumber(ev.target.value);
                    if (next === "invalid") return;
                    if ((set.actual?.weightKg ?? null) === next) return;
                    onUpdateSetActual({
                      exerciseId,
                      setIndex,
                      weightKg: next,
                      reps: set.actual?.reps ?? null,
                      durationSeconds: set.actual?.durationSeconds ?? null,
                      distanceMeters: set.actual?.distanceMeters ?? null,
                      note: set.actual?.note ?? null,
                    });
                  }}
                  className="w-full bg-transparent pr-8 text-lg font-bold text-[var(--shell-ink)] outline-none"
                  aria-label={`Actual weight for set ${setIndex + 1}`}
                />
                <span className="pointer-events-none absolute right-0 text-xs text-[var(--shell-muted)]">
                  kg
                </span>
              </div>
            </div>
          </>
        ) : isDuration ? (
          <div className="flex h-14 flex-col justify-between border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
              Duration
            </span>
            <div className="relative flex items-center">
              <input
                key={`${exerciseId}-${setIndex}-duration-${set.actual?.durationSeconds ?? set.target?.durationSeconds ?? "none"}`}
                type="number"
                min={0}
                defaultValue={
                  set.actual?.durationSeconds ?? set.target?.durationSeconds ?? ""
                }
                onBlur={(ev) => {
                  const next = parseNullableNumber(ev.target.value);
                  if (next === "invalid") return;
                  if ((set.actual?.durationSeconds ?? null) === next) return;
                  onUpdateSetActual({
                    exerciseId,
                    setIndex,
                    durationSeconds: next,
                    reps: set.actual?.reps ?? null,
                    weightKg: set.actual?.weightKg ?? null,
                    distanceMeters: set.actual?.distanceMeters ?? null,
                    note: set.actual?.note ?? null,
                  });
                }}
                className="w-full bg-transparent pr-6 text-lg font-bold text-[var(--shell-ink)] outline-none"
                aria-label={`Actual duration for set ${setIndex + 1}`}
              />
              <span className="pointer-events-none absolute right-0 text-xs text-[var(--shell-muted)]">
                s
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-14 flex-col justify-between border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
              Distance
            </span>
            <div className="relative flex items-center">
              <input
                key={`${exerciseId}-${setIndex}-distance-${set.actual?.distanceMeters ?? set.target?.distanceMeters ?? "none"}`}
                type="number"
                min={0}
                defaultValue={
                  set.actual?.distanceMeters ?? set.target?.distanceMeters ?? ""
                }
                onBlur={(ev) => {
                  const next = parseNullableNumber(ev.target.value);
                  if (next === "invalid") return;
                  if ((set.actual?.distanceMeters ?? null) === next) return;
                  onUpdateSetActual({
                    exerciseId,
                    setIndex,
                    distanceMeters: next,
                    reps: set.actual?.reps ?? null,
                    weightKg: set.actual?.weightKg ?? null,
                    durationSeconds: set.actual?.durationSeconds ?? null,
                    note: set.actual?.note ?? null,
                  });
                }}
                className="w-full bg-transparent pr-6 text-lg font-bold text-[var(--shell-ink)] outline-none"
                aria-label={`Actual distance for set ${setIndex + 1}`}
              />
              <span className="pointer-events-none absolute right-0 text-xs text-[var(--shell-muted)]">
                m
              </span>
            </div>
          </div>
        )}
      </div>

      <div className={`mt-3 ${isDone ? "opacity-50" : ""}`}>
        <input
          key={`${exerciseId}-${setIndex}-note-${set.actual?.note ?? "none"}`}
          type="text"
          defaultValue={set.actual?.note ?? ""}
          onBlur={(ev) => {
            const nextNote = ev.target.value.trim() || null;
            if ((set.actual?.note ?? null) === nextNote) return;
            onUpdateSetActual({
              exerciseId,
              setIndex,
              note: nextNote,
              reps: set.actual?.reps ?? null,
              weightKg: set.actual?.weightKg ?? null,
              durationSeconds: set.actual?.durationSeconds ?? null,
              distanceMeters: set.actual?.distanceMeters ?? null,
            });
          }}
          className="h-10 w-full border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 text-sm text-[var(--shell-ink)] outline-none placeholder:text-[var(--shell-muted)]"
          placeholder="Set note..."
          aria-label={`Note for set ${setIndex + 1}`}
        />
      </div>

      <button
        type="button"
        disabled={isPending}
        onClick={() => onToggleSetDone({ exerciseId, setIndex })}
        className={`mt-3 flex w-full items-center justify-center gap-2 border border-[var(--shell-border)] py-3 text-sm font-semibold uppercase tracking-[0.14em] transition disabled:opacity-60 ${
          isDone
            ? "bg-[var(--shell-ink)] text-[var(--shell-surface)]"
            : "bg-[var(--shell-surface-strong)] text-[var(--shell-ink)] hover:brightness-95"
        }`}
      >
        <CheckCircle2Icon className="h-4 w-4" />
        {isDone ? "✓ Set done" : "Mark set done"}
      </button>
    </div>
  );
}
