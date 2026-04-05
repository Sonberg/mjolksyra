import { useCallback, useState } from "react";
import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import { ExerciseType } from "@/lib/exercisePrescription";
import { useDebounce } from "@/hooks/useDebounce";
import {
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

const inputCls =
  "h-9 w-[4.5rem] border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 text-sm text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--shell-accent)]";

export function WorkoutExerciseSetCard({
  exerciseId,
  set,
  setIndex,
  targetType,
  isEditable,
  isPending,
  onToggleSetDone,
  onUpdateSetActual,
}: Props) {
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
      ) return;
      onUpdateSetActual({
        exerciseId,
        setIndex,
        weightKg,
        reps,
        durationSeconds,
        distanceMeters,
        note: nextDraft.note.trim().length ? nextDraft.note.trim() : null,
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

  const isDone = set.actual?.isDone;
  const isSetsReps = targetType === ExerciseType.SetsReps;
  const isDurationSeconds = targetType === ExerciseType.DurationSeconds;

  return (
    <div className="flex items-center gap-3 px-3 py-2 sm:px-4">
      {/* Set number badge */}
      <div className="grid h-6 w-6 shrink-0 place-items-center border border-[var(--shell-border)] text-[10px] font-bold text-[var(--shell-muted)]">
        {setIndex + 1}
      </div>

      {/* Primary value: reps / duration / distance */}
      {isEditable ? (
        <input
          type="number"
          min={0}
          value={isSetsReps ? draft.reps : isDurationSeconds ? draft.durationSeconds : draft.distanceMeters}
          onChange={(ev) =>
            updateDraft(
              isSetsReps
                ? { reps: ev.target.value }
                : isDurationSeconds
                  ? { durationSeconds: ev.target.value }
                  : { distanceMeters: ev.target.value },
            )
          }
          onBlur={() => commitDraft(draft)}
          className={inputCls}
          aria-label={
            isSetsReps
              ? `Reps for set ${setIndex + 1}`
              : isDurationSeconds
                ? `Duration for set ${setIndex + 1}`
                : `Distance for set ${setIndex + 1}`
          }
        />
      ) : (
        <p
          className={
            isDone
              ? "w-[4.5rem] text-base font-semibold text-[var(--shell-muted)] line-through"
              : "w-[4.5rem] text-base font-semibold text-[var(--shell-ink)]"
          }
        >
          {isSetsReps
            ? (set.actual?.reps ?? "–")
            : isDurationSeconds
              ? (set.actual?.durationSeconds ?? "–")
              : (set.actual?.distanceMeters ?? "–")}
        </p>
      )}

      {/* Kg column — SetsReps only */}
      {isSetsReps ? (
        isEditable ? (
          <input
            type="number"
            min={0}
            step="0.5"
            value={draft.weightKg}
            onChange={(ev) => updateDraft({ weightKg: ev.target.value })}
            onBlur={() => commitDraft(draft)}
            className={inputCls}
            aria-label={`Weight for set ${setIndex + 1}`}
          />
        ) : (
          <p
            className={
              isDone
                ? "w-[4.5rem] text-base font-semibold text-[var(--shell-muted)] line-through"
                : "w-[4.5rem] text-base font-semibold text-[var(--shell-ink)]"
            }
          >
            {set.actual?.weightKg ?? "–"}
          </p>
        )
      ) : null}

      {/* Note */}
      {isEditable ? (
        <input
          type="text"
          value={draft.note}
          onChange={(ev) => updateDraft({ note: ev.target.value })}
          onBlur={() => commitDraft(draft)}
          className="h-9 min-w-0 flex-1 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 text-xs text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--shell-accent)]"
          placeholder="Note"
          aria-label={`Note for set ${setIndex + 1}`}
        />
      ) : (
        <p className="min-w-0 flex-1 truncate text-xs text-[var(--shell-muted)]">
          {set.actual?.note?.trim() || ""}
        </p>
      )}

      {/* Done toggle */}
      {isEditable ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => onToggleSetDone({ exerciseId, setIndex })}
          className={
            isDone
              ? "inline-flex w-[3.5rem] shrink-0 items-center justify-center gap-1 border border-transparent bg-[var(--shell-accent)] py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)] transition disabled:opacity-60"
              : "inline-flex w-[3.5rem] shrink-0 items-center justify-center gap-1 border border-[var(--shell-border)] bg-[var(--shell-surface)] py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)] disabled:opacity-60"
          }
          title={isDone ? "Mark set incomplete" : "Mark set done"}
        >
          {isDone ? <CheckCircle2Icon className="h-3.5 w-3.5" /> : <CircleIcon className="h-3.5 w-3.5" />}
        </button>
      ) : (
        <span
          className={
            isDone
              ? "inline-flex w-[3.5rem] shrink-0 items-center justify-center gap-1 border border-transparent bg-[var(--shell-accent)] py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)]"
              : "inline-flex w-[3.5rem] shrink-0 items-center justify-center gap-1 border border-[var(--shell-border)] bg-[var(--shell-surface)] py-1.5 text-[10px] font-semibold text-[var(--shell-muted)]"
          }
        >
          {isDone ? <CheckCircle2Icon className="h-3.5 w-3.5" /> : <CircleIcon className="h-3.5 w-3.5" />}
        </span>
      )}
    </div>
  );
}
