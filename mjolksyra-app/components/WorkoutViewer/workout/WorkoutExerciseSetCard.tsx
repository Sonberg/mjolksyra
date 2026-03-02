import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import { ExercisePrescriptionTargetType } from "@/lib/exercisePrescription";
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
  targetType: ExercisePrescriptionTargetType | undefined;
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
    <div className="flex items-start justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-2 sm:px-3">
      <div className="min-w-0">
        <div
          className={
            set.actual?.isDone
              ? "text-sm font-semibold text-zinc-500 line-through"
              : "text-sm font-semibold text-zinc-200"
          }
        >
          Set {setIndex + 1}: {getSetTargetLabel(targetType, set.target)}
        </div>
        {set.target?.note?.trim() ? (
          <div className="mt-1 text-xs text-zinc-400">{set.target.note}</div>
        ) : null}
        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Target
          </span>
          <span>
            {targetType === ExercisePrescriptionTargetType.SetsReps
              ? `${set.target?.reps ?? "-"} reps`
              : targetType === ExercisePrescriptionTargetType.DurationSeconds
                ? `${set.target?.durationSeconds ?? "-"} s`
                : `${set.target?.distanceMeters ?? "-"} m`}
          </span>
          {targetType === ExercisePrescriptionTargetType.SetsReps &&
          typeof set.target?.weightKg === "number" ? (
            <>
              <span className="text-zinc-600">•</span>
              <span>{set.target.weightKg} kg</span>
            </>
          ) : null}
        </div>
        <div className="mt-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Actual
          </span>
          {isEditable ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {targetType === ExercisePrescriptionTargetType.SetsReps ? (
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
                    className="h-8 w-24 rounded border border-zinc-700 bg-zinc-900 pl-2 pr-10 text-xs text-zinc-100"
                    aria-label={`Actual reps for set ${setIndex + 1}`}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                    reps
                  </span>
                </div>
              ) : null}
              {targetType === ExercisePrescriptionTargetType.DurationSeconds ? (
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
                    className="h-8 w-24 rounded border border-zinc-700 bg-zinc-900 pl-2 pr-7 text-xs text-zinc-100"
                    aria-label={`Actual duration for set ${setIndex + 1}`}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                    s
                  </span>
                </div>
              ) : null}
              {targetType === ExercisePrescriptionTargetType.DistanceMeters ? (
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
                    className="h-8 w-24 rounded border border-zinc-700 bg-zinc-900 pl-2 pr-7 text-xs text-zinc-100"
                    aria-label={`Actual distance for set ${setIndex + 1}`}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                    m
                  </span>
                </div>
              ) : null}
              {targetType === ExercisePrescriptionTargetType.SetsReps ? (
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
                    className="h-8 w-24 rounded border border-zinc-700 bg-zinc-900 pl-2 pr-7 text-xs text-zinc-100"
                    aria-label={`Actual weight for set ${setIndex + 1}`}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
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
                className="h-8 min-w-[180px] flex-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100"
                placeholder="Set note (actual)"
                aria-label={`Actual note for set ${setIndex + 1}`}
              />
            </div>
          ) : (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-300">
              <span>
                {targetType === ExercisePrescriptionTargetType.SetsReps
                  ? `${set.actual?.reps ?? "-"} reps`
                  : targetType === ExercisePrescriptionTargetType.DurationSeconds
                    ? `${set.actual?.durationSeconds ?? "-"} s`
                    : `${set.actual?.distanceMeters ?? "-"} m`}
              </span>
              {targetType === ExercisePrescriptionTargetType.SetsReps ? (
                <>
                  <span className="text-zinc-600">•</span>
                  <span>{set.actual?.weightKg ?? "-"} kg</span>
                </>
              ) : null}
              {set.actual?.note?.trim() ? (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400">{set.actual.note}</span>
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
              ? "inline-flex items-center justify-center gap-1 rounded-full border border-emerald-700/60 bg-emerald-900/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-200 transition hover:bg-emerald-900/45 disabled:opacity-60"
              : "inline-flex items-center justify-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-60"
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
              ? "inline-flex items-center justify-center gap-1 rounded-full border border-emerald-700/60 bg-emerald-900/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-200"
              : "inline-flex items-center justify-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-300"
          }
        >
          {set.actual?.isDone ? "Done" : "Not done"}
        </span>
      )}
    </div>
  );
}
