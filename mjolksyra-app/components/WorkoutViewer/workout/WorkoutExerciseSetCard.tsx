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
                    type="number"
                    min={0}
                    value={draft.reps}
                    onChange={(ev) => updateDraft({ reps: ev.target.value })}
                    onBlur={() => commitDraft(draft)}
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
                    type="number"
                    min={0}
                    value={draft.durationSeconds}
                    onChange={(ev) =>
                      updateDraft({ durationSeconds: ev.target.value })
                    }
                    onBlur={() => commitDraft(draft)}
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
                    type="number"
                    min={0}
                    value={draft.distanceMeters}
                    onChange={(ev) =>
                      updateDraft({ distanceMeters: ev.target.value })
                    }
                    onBlur={() => commitDraft(draft)}
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
                    type="number"
                    min={0}
                    step="0.5"
                    value={draft.weightKg}
                    onChange={(ev) => updateDraft({ weightKg: ev.target.value })}
                    onBlur={() => commitDraft(draft)}
                    className="h-8 w-24 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-7 text-xs text-[var(--shell-ink)]"
                    aria-label={`Actual weight for set ${setIndex + 1}`}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--shell-muted)]">
                    kg
                  </span>
                </div>
              ) : null}
              <input
                type="text"
                value={draft.note}
                onChange={(ev) => updateDraft({ note: ev.target.value })}
                onBlur={() => commitDraft(draft)}
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
