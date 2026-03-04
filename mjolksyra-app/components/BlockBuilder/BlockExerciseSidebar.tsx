import { Textarea } from "../ui/textarea";
import {
  ExercisePrescription,
  ExercisePrescriptionTargetType,
  formatPrescription,
} from "@/lib/exercisePrescription";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { BlockExercise } from "@/services/blocks/type";

type Props = {
  title: string;
  exercise: BlockExercise;
  onUpdateNote: (note: string | null) => void;
  onUpdatePrescription: (prescription: ExercisePrescription | null) => void;
  onClose: () => void;
};

function targetForType(
  targetType: ExercisePrescription["targetType"],
  source?: {
    reps: number | null;
    durationSeconds: number | null;
    distanceMeters: number | null;
    weightKg: number | null;
    note: string | null;
  } | null,
) {
  if (targetType === ExercisePrescriptionTargetType.SetsReps) {
    return {
      target: {
        reps: source?.reps ?? null,
        durationSeconds: null,
        distanceMeters: null,
        weightKg: source?.weightKg ?? null,
        note: source?.note ?? null,
      },
      actual: null,
    };
  }

  if (targetType === ExercisePrescriptionTargetType.DurationSeconds) {
    return {
      target: {
        reps: null,
        durationSeconds: source?.durationSeconds ?? 30,
        distanceMeters: null,
        weightKg: null,
        note: source?.note ?? null,
      },
      actual: null,
    };
  }

  return {
    target: {
      reps: null,
      durationSeconds: null,
      distanceMeters: source?.distanceMeters ?? 1000,
      weightKg: null,
      note: source?.note ?? null,
    },
    actual: null,
  };
}

function defaultPrescription(): ExercisePrescription {
  return {
    targetType: ExercisePrescriptionTargetType.SetsReps,
    sets: [targetForType(ExercisePrescriptionTargetType.SetsReps)],
  };
}

function normalizedSets(prescription: ExercisePrescription) {
  if (prescription.sets?.length) {
    return prescription.sets;
  }

  if (prescription.targetType === ExercisePrescriptionTargetType.SetsReps) {
    return [targetForType(ExercisePrescriptionTargetType.SetsReps)];
  }

  if (prescription.targetType === ExercisePrescriptionTargetType.DurationSeconds) {
    return [targetForType(ExercisePrescriptionTargetType.DurationSeconds)];
  }

  return [targetForType(ExercisePrescriptionTargetType.DistanceMeters)];
}

export function BlockExerciseSidebar({
  title,
  exercise,
  onUpdateNote,
  onUpdatePrescription,
  onClose,
}: Props) {
  const prescription = exercise.prescription ?? defaultPrescription();
  const sets = normalizedSets(prescription);

  function patchSetTarget(
    index: number,
    patch: Partial<{
      reps: number | null;
      durationSeconds: number | null;
      distanceMeters: number | null;
      weightKg: number | null;
      note: string | null;
    }>,
  ) {
    const nextSets = sets.map((set, setIndex) => {
      if (setIndex !== index) {
        return set;
      }

      const target = set.target;
      return {
        ...set,
        target: {
          reps: target?.reps ?? null,
          durationSeconds: target?.durationSeconds ?? null,
          distanceMeters: target?.distanceMeters ?? null,
          weightKg: target?.weightKg ?? null,
          note: target?.note ?? null,
          ...patch,
        },
      };
    });

    onUpdatePrescription({
      ...prescription,
      sets: nextSets,
    });
  }

  function updateTargetType(targetType: ExercisePrescription["targetType"]) {
    const sourceSet = sets[0];
    const setsForType = [targetForType(targetType, sourceSet?.target)];

    onUpdatePrescription({
      targetType,
      sets: setsForType,
    });
  }

  function addSet() {
    const sourceSet = sets[sets.length - 1] ?? sets[0];
    const nextSet = targetForType(prescription.targetType, sourceSet?.target);

    onUpdatePrescription({
      ...prescription,
      sets: [...sets, nextSet],
    });
  }

  function removeSet(index: number) {
    const nextSets = sets.filter((_, setIndex) => setIndex !== index);
    if (!nextSets.length) {
      return;
    }

    onUpdatePrescription({
      ...prescription,
      sets: nextSets,
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b-2 border-[var(--shell-border)]/30 bg-[var(--shell-surface)] px-6 py-6">
        <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--shell-muted)]">Editing</div>
        <div className="mt-1 text-lg font-semibold text-[var(--shell-ink)]">{exercise.name}</div>
        <div className="mt-1 text-xs text-[var(--shell-muted)]">{title}</div>
        <div className="mt-2 text-xs uppercase tracking-[0.08em] text-[var(--shell-muted)]">
          {formatPrescription(prescription) ?? "No set plan"}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-1 text-xs text-[var(--shell-ink)] hover:bg-[var(--shell-surface-strong)]"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-3">
          <Textarea
            value={exercise.note ?? ""}
            onChange={(ev) => onUpdateNote(ev.target.value || null)}
            placeholder="Add note for this exercise..."
            className="min-h-16 border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)]"
          />

          <div className="space-y-2 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--shell-muted)]">
              Target setup
            </div>
            <select
              value={prescription.targetType}
              onChange={(ev) =>
                updateTargetType(ev.target.value as ExercisePrescription["targetType"])
              }
              className="h-9 w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 text-sm text-[var(--shell-ink)]"
            >
              <option value={ExercisePrescriptionTargetType.SetsReps}>Sets + reps</option>
              <option value={ExercisePrescriptionTargetType.DurationSeconds}>
                Static hold time
              </option>
              <option value={ExercisePrescriptionTargetType.DistanceMeters}>Distance</option>
            </select>

            <div className="space-y-2">
              {sets.map((set, setIndex) => (
                <div
                  key={`${exercise.id}-set-${setIndex}`}
                  className="space-y-2 rounded-none border-2 border-[var(--shell-border)]/60 bg-[var(--shell-surface-strong)]/55 p-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]">
                      Set {setIndex + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSet(setIndex)}
                      disabled={sets.length <= 1}
                      className="inline-flex items-center gap-1 rounded-none border-2 border-[var(--shell-border)] px-1.5 py-1 text-[10px] text-[var(--shell-ink)] disabled:opacity-40"
                    >
                      <Trash2Icon className="h-3 w-3" />
                      Remove
                    </button>
                  </div>

                  {prescription.targetType === ExercisePrescriptionTargetType.SetsReps ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          value={set.target?.reps ?? ""}
                          onChange={(ev) =>
                            patchSetTarget(setIndex, {
                              reps: ev.target.value ? Number(ev.target.value) : null,
                            })
                          }
                          className="h-8 w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-10 text-xs text-[var(--shell-ink)]"
                          placeholder="0"
                          aria-label="Reps"
                        />
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--shell-muted)]">
                          reps
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          step="0.5"
                          value={set.target?.weightKg ?? ""}
                          onChange={(ev) =>
                            patchSetTarget(setIndex, {
                              weightKg: ev.target.value ? Number(ev.target.value) : null,
                            })
                          }
                          className="h-8 w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-7 text-xs text-[var(--shell-ink)]"
                          placeholder="0"
                          aria-label="Target weight in kilograms"
                        />
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--shell-muted)]">
                          kg
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {prescription.targetType ===
                  ExercisePrescriptionTargetType.DurationSeconds ? (
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        value={set.target?.durationSeconds ?? ""}
                        onChange={(ev) =>
                          patchSetTarget(setIndex, {
                            durationSeconds: ev.target.value
                              ? Number(ev.target.value)
                              : null,
                          })
                        }
                        className="h-8 w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-7 text-xs text-[var(--shell-ink)]"
                        placeholder="0"
                        aria-label="Seconds"
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--shell-muted)]">
                        s
                      </span>
                    </div>
                  ) : null}

                  {prescription.targetType ===
                  ExercisePrescriptionTargetType.DistanceMeters ? (
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        value={set.target?.distanceMeters ?? ""}
                        onChange={(ev) =>
                          patchSetTarget(setIndex, {
                            distanceMeters: ev.target.value
                              ? Number(ev.target.value)
                              : null,
                          })
                        }
                        className="h-8 w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-7 text-xs text-[var(--shell-ink)]"
                        placeholder="0"
                        aria-label="Meters"
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--shell-muted)]">
                        m
                      </span>
                    </div>
                  ) : null}

                  <input
                    type="text"
                    value={set.target?.note ?? ""}
                    onChange={(ev) =>
                      patchSetTarget(setIndex, {
                        note: ev.target.value || null,
                      })
                    }
                    className="h-8 w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 text-xs text-[var(--shell-ink)]"
                    placeholder="Set note (optional)"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addSet}
                className="inline-flex items-center gap-1 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-ink)]"
              >
                <PlusIcon className="h-3 w-3" />
                Add set
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
