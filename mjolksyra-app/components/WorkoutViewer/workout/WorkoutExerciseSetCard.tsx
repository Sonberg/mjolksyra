import { useCallback, useState } from "react";
import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import { ExerciseType } from "@/lib/exercisePrescription";
import { useDebounce } from "@/hooks/useDebounce";
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

  return (
    <div className="grid grid-cols-[1fr_auto] items-start gap-3 px-3 py-3 sm:px-4">
      <div className="min-w-0 space-y-2">
        {/* Set label + target */}
        <div className="grid grid-cols-[5rem_1fr] items-baseline gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
            Set {setIndex + 1}
          </p>
          <p
            className={
              isDone
                ? "text-xs text-[var(--shell-muted)] line-through"
                : "text-xs font-medium text-[var(--shell-ink)]"
            }
          >
            {targetType === ExerciseType.SetsReps
              ? `${set.target?.reps ?? "–"} reps${typeof set.target?.weightKg === "number" ? ` · ${set.target.weightKg} kg` : ""}`
              : targetType === ExerciseType.DurationSeconds
                ? `${set.target?.durationSeconds ?? "–"} s`
                : `${set.target?.distanceMeters ?? "–"} m`}
          </p>
        </div>

        {set.target?.note?.trim() ? (
          <p className="text-xs text-[var(--shell-muted)]">{set.target.note}</p>
        ) : null}

        {/* Actual */}
        <div className="grid grid-cols-[5rem_1fr] items-start gap-2">
          <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
            Actual
          </p>
          {isEditable ? (
            <div className="flex flex-wrap items-center gap-2">
              {targetType === ExerciseType.SetsReps ? (
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={draft.reps}
                    onChange={(ev) => updateDraft({ reps: ev.target.value })}
                    onBlur={() => commitDraft(draft)}
                    className="h-7 w-20 border border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-8 text-xs text-[var(--shell-ink)]"
                    aria-label={`Actual reps for set ${setIndex + 1}`}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--shell-muted)]">
                    reps
                  </span>
                </div>
              ) : null}
              {targetType === ExerciseType.DurationSeconds ? (
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={draft.durationSeconds}
                    onChange={(ev) =>
                      updateDraft({ durationSeconds: ev.target.value })
                    }
                    onBlur={() => commitDraft(draft)}
                    className="h-7 w-20 border border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-6 text-xs text-[var(--shell-ink)]"
                    aria-label={`Actual duration for set ${setIndex + 1}`}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--shell-muted)]">
                    s
                  </span>
                </div>
              ) : null}
              {targetType === ExerciseType.DistanceMeters ? (
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={draft.distanceMeters}
                    onChange={(ev) =>
                      updateDraft({ distanceMeters: ev.target.value })
                    }
                    onBlur={() => commitDraft(draft)}
                    className="h-7 w-20 border border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-6 text-xs text-[var(--shell-ink)]"
                    aria-label={`Actual distance for set ${setIndex + 1}`}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--shell-muted)]">
                    m
                  </span>
                </div>
              ) : null}
              {targetType === ExerciseType.SetsReps ? (
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={draft.weightKg}
                    onChange={(ev) => updateDraft({ weightKg: ev.target.value })}
                    onBlur={() => commitDraft(draft)}
                    className="h-7 w-20 border border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-6 text-xs text-[var(--shell-ink)]"
                    aria-label={`Actual weight for set ${setIndex + 1}`}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--shell-muted)]">
                    kg
                  </span>
                </div>
              ) : null}
              <input
                type="text"
                value={draft.note}
                onChange={(ev) => updateDraft({ note: ev.target.value })}
                onBlur={() => commitDraft(draft)}
                className="h-7 min-w-[140px] flex-1 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 text-xs text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)]"
                placeholder="Note"
                aria-label={`Actual note for set ${setIndex + 1}`}
              />
            </div>
          ) : (
            <p className="pt-0.5 text-xs text-[var(--shell-ink)]">
              {targetType === ExerciseType.SetsReps
                ? `${set.actual?.reps ?? "–"} reps${typeof set.actual?.weightKg === "number" ? ` · ${set.actual.weightKg} kg` : ""}`
                : targetType === ExerciseType.DurationSeconds
                  ? `${set.actual?.durationSeconds ?? "–"} s`
                  : `${set.actual?.distanceMeters ?? "–"} m`}
              {set.actual?.note?.trim() ? (
                <span className="ml-2 text-[var(--shell-muted)]">
                  · {set.actual.note}
                </span>
              ) : null}
            </p>
          )}
        </div>
      </div>

      {/* Done toggle */}
      {isEditable ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => onToggleSetDone({ exerciseId, setIndex })}
          className={
            isDone
              ? "mt-0.5 inline-flex items-center gap-1.5 border border-transparent bg-[var(--shell-accent)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)] transition disabled:opacity-60"
              : "mt-0.5 inline-flex items-center gap-1.5 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)] disabled:opacity-60"
          }
          title={isDone ? "Mark set incomplete" : "Mark set done"}
        >
          {isDone ? (
            <CheckCircle2Icon className="h-3 w-3" />
          ) : (
            <CircleIcon className="h-3 w-3" />
          )}
          {isDone ? "Done" : "Mark"}
        </button>
      ) : (
        <span
          className={
            isDone
              ? "mt-0.5 inline-flex items-center gap-1.5 border border-transparent bg-[var(--shell-accent)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)]"
              : "mt-0.5 inline-flex items-center gap-1.5 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]"
          }
        >
          {isDone ? "Done" : "–"}
        </span>
      )}
    </div>
  );
}
