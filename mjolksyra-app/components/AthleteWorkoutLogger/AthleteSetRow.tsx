"use client";

import { useCallback, useState } from "react";
import { CheckCircle2Icon } from "lucide-react";
import { ExerciseType } from "@/lib/exercisePrescription";
import { useDebounce } from "@/hooks/useDebounce";
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

type SetActualDraft = {
  reps: string;
  weightKg: string;
  durationSeconds: string;
  distanceMeters: string;
  note: string;
};

function toInputValue(value: number | null | undefined): string {
  return value == null ? "" : String(value);
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
  const [draft, setDraft] = useState<SetActualDraft>({
    reps: toInputValue(set.actual?.reps ?? set.target?.reps ?? null),
    weightKg: toInputValue(set.actual?.weightKg ?? set.target?.weightKg ?? null),
    durationSeconds: toInputValue(
      set.actual?.durationSeconds ?? set.target?.durationSeconds ?? null,
    ),
    distanceMeters: toInputValue(
      set.actual?.distanceMeters ?? set.target?.distanceMeters ?? null,
    ),
    note: set.actual?.note ?? "",
  });

  const commitDraft = useCallback(
    (nextDraft: SetActualDraft) => {
      const reps = parseNullableNumber(nextDraft.reps);
      const weightKg = parseNullableNumber(nextDraft.weightKg);
      const durationSeconds = parseNullableNumber(nextDraft.durationSeconds);
      const distanceMeters = parseNullableNumber(nextDraft.distanceMeters);
      if (
        reps === "invalid" ||
        weightKg === "invalid" ||
        durationSeconds === "invalid" ||
        distanceMeters === "invalid"
      ) {
        return;
      }

      onUpdateSetActual({
        exerciseId,
        setIndex,
        reps,
        weightKg,
        durationSeconds,
        distanceMeters,
        note: nextDraft.note.trim() || null,
      });
    },
    [exerciseId, onUpdateSetActual, setIndex],
  );

  const commitDraftDebounced = useDebounce(commitDraft, 600);

  function updateDraft(partial: Partial<SetActualDraft>) {
    setDraft((prev) => {
      const next = { ...prev, ...partial };
      commitDraftDebounced(next);
      return next;
    });
  }

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
                  type="number"
                  min={0}
                  value={draft.reps}
                  onChange={(ev) => updateDraft({ reps: ev.target.value })}
                  onBlur={() => commitDraft(draft)}
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
                  type="number"
                  min={0}
                  step="0.5"
                  value={draft.weightKg}
                  onChange={(ev) => updateDraft({ weightKg: ev.target.value })}
                  onBlur={() => commitDraft(draft)}
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
                type="number"
                min={0}
                value={draft.durationSeconds}
                onChange={(ev) => updateDraft({ durationSeconds: ev.target.value })}
                onBlur={() => commitDraft(draft)}
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
                type="number"
                min={0}
                value={draft.distanceMeters}
                onChange={(ev) => updateDraft({ distanceMeters: ev.target.value })}
                onBlur={() => commitDraft(draft)}
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
          type="text"
          value={draft.note}
          onChange={(ev) => updateDraft({ note: ev.target.value })}
          onBlur={() => commitDraft(draft)}
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
