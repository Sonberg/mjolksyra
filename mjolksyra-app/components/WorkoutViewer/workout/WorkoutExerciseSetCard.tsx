import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2Icon, GripVerticalIcon, XIcon } from "lucide-react";
import { ExerciseType } from "@/lib/exercisePrescription";
import { useDebounce } from "@/hooks/useDebounce";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  RemoveSetRowInput,
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
  isEditMode: boolean;
  isPending: boolean;
  onToggleSetDone: (input: ToggleSetDoneInput) => void;
  onUpdateSetActual: (input: UpdateSetActualInput) => void;
  onRemoveSetRow?: (input: RemoveSetRowInput) => void;
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

function buildDraftFromSet(set: WorkoutSet): SetActualDraft {
  return {
    reps: toInputValue(set.actual?.reps ?? set.target?.reps ?? null),
    weightKg: toInputValue(set.actual?.weightKg ?? set.target?.weightKg ?? null),
    durationSeconds: toInputValue(
      set.actual?.durationSeconds ?? set.target?.durationSeconds ?? null,
    ),
    distanceMeters: toInputValue(
      set.actual?.distanceMeters ?? set.target?.distanceMeters ?? null,
    ),
    note: set.actual?.note ?? "",
  };
}

const inputCls =
  "h-9 w-[4.5rem] border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 text-sm text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--shell-accent)]";

const inputDisabledCls =
  "h-9 w-[4.5rem] border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 text-sm text-[var(--shell-ink)] opacity-40 cursor-not-allowed";

export function WorkoutExerciseSetCard({
  exerciseId,
  set,
  setIndex,
  targetType,
  isEditable,
  isEditMode,
  isPending,
  onToggleSetDone,
  onUpdateSetActual,
  onRemoveSetRow,
}: Props) {
  const [draft, setDraft] = useState<SetActualDraft>(() => buildDraftFromSet(set));
  const isEditingRef = useRef(false);

  useEffect(() => {
    if (!isEditingRef.current) {
      setDraft(buildDraftFromSet(set));
    }
  }, [set]);

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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: setIndex });

  const style = isEditMode
    ? { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
    : undefined;

  const isDone = set.actual?.isDone;
  const isSetsReps = targetType === ExerciseType.SetsReps;
  const isDurationSeconds = targetType === ExerciseType.DurationSeconds;
  const activeInput = isEditable && !isEditMode;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditMode ? attributes : {})}
      className="px-3 py-2 sm:px-4"
    >
      {/* Main row */}
      <div className="flex items-center gap-3">
        {/* Left: drag handle in edit mode, merged done/number otherwise */}
        {isEditMode ? (
          <button
            type="button"
            className="shrink-0 cursor-grab touch-none text-[var(--shell-muted)] active:cursor-grabbing"
            {...listeners}
            aria-label="Drag to reorder set"
          >
            <GripVerticalIcon className="h-4 w-4" />
          </button>
        ) : isEditable ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => onToggleSetDone({ exerciseId, setIndex })}
            className={
              isDone
                ? "grid h-6 w-6 shrink-0 place-items-center bg-[var(--shell-accent)] text-[var(--shell-accent-ink)] transition disabled:opacity-60"
                : "grid h-6 w-6 shrink-0 place-items-center border border-[var(--shell-border)] text-[var(--shell-muted)] transition hover:border-[var(--shell-ink)] hover:text-[var(--shell-ink)] disabled:opacity-60"
            }
            title={isDone ? "Mark set incomplete" : "Mark set done"}
          >
            {isDone ? (
              <CheckCircle2Icon className="h-3.5 w-3.5" />
            ) : (
              <span className="text-[10px] font-bold leading-none">{setIndex + 1}</span>
            )}
          </button>
        ) : (
          <div
            className={
              isDone
                ? "grid h-6 w-6 shrink-0 place-items-center bg-[var(--shell-accent)] text-[var(--shell-accent-ink)]"
                : "grid h-6 w-6 shrink-0 place-items-center border border-[var(--shell-border)] text-[var(--shell-muted)]"
            }
          >
            {isDone ? (
              <CheckCircle2Icon className="h-3.5 w-3.5" />
            ) : (
              <span className="text-[10px] font-bold leading-none">{setIndex + 1}</span>
            )}
          </div>
        )}

        {/* Kg — SetsReps only, first */}
        {isSetsReps ? (
          activeInput ? (
            <input
              type="number"
              min={0}
              step="0.5"
              value={draft.weightKg}
              onFocus={() => { isEditingRef.current = true; }}
              onChange={(ev) => updateDraft({ weightKg: ev.target.value })}
              onBlur={() => { isEditingRef.current = false; commitDraft(draft); }}
              className={inputCls}
              aria-label={`Weight for set ${setIndex + 1}`}
            />
          ) : isEditMode ? (
            <input
              type="number"
              disabled
              value={draft.weightKg}
              className={inputDisabledCls}
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

        {/* Primary: reps / duration / distance */}
        {activeInput ? (
          <input
            type="number"
            min={0}
            value={
              isSetsReps
                ? draft.reps
                : isDurationSeconds
                  ? draft.durationSeconds
                  : draft.distanceMeters
            }
            onFocus={() => { isEditingRef.current = true; }}
            onChange={(ev) =>
              updateDraft(
                isSetsReps
                  ? { reps: ev.target.value }
                  : isDurationSeconds
                    ? { durationSeconds: ev.target.value }
                    : { distanceMeters: ev.target.value },
              )
            }
            onBlur={() => { isEditingRef.current = false; commitDraft(draft); }}
            className={inputCls}
            aria-label={
              isSetsReps
                ? `Reps for set ${setIndex + 1}`
                : isDurationSeconds
                  ? `Duration for set ${setIndex + 1}`
                  : `Distance for set ${setIndex + 1}`
            }
          />
        ) : isEditMode ? (
          <input
            type="number"
            disabled
            value={
              isSetsReps
                ? draft.reps
                : isDurationSeconds
                  ? draft.durationSeconds
                  : draft.distanceMeters
            }
            className={inputDisabledCls}
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

        {/* Delete — edit mode only */}
        {isEditMode && isEditable && onRemoveSetRow ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => onRemoveSetRow({ exerciseId, setIndex })}
            className="ml-auto inline-flex h-9 w-7 shrink-0 items-center justify-center border border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-muted)] transition hover:border-red-300 hover:text-red-500 disabled:opacity-40"
            title="Remove set"
          >
            <XIcon className="h-3 w-3" />
          </button>
        ) : null}
      </div>

      {/* Note row — hidden in edit mode */}
      {!isEditMode ? (
        <div className="mt-1.5 pl-9">
          {activeInput ? (
            <input
              type="text"
              value={draft.note}
              onFocus={() => { isEditingRef.current = true; }}
              onChange={(ev) => updateDraft({ note: ev.target.value })}
              onBlur={() => { isEditingRef.current = false; commitDraft(draft); }}
              className="h-8 w-full border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 text-xs text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--shell-accent)]"
              placeholder="Note"
              aria-label={`Note for set ${setIndex + 1}`}
            />
          ) : (
            set.actual?.note?.trim() ? (
              <p className="text-xs text-[var(--shell-muted)]">{set.actual.note.trim()}</p>
            ) : null
          )}
        </div>
      ) : null}
    </div>
  );
}
