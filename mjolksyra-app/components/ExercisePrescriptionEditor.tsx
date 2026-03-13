"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  ExercisePrescription,
  ExerciseType,
  targetForType,
  normalizedSets,
} from "@/lib/exercisePrescription";

type Props = {
  prescription: ExercisePrescription | null;
  exerciseId: string;
  onChange: (p: ExercisePrescription) => void;
  size?: "sm" | "default";
};

function defaultPrescription(): ExercisePrescription {
  return {
    type: ExerciseType.SetsReps,
    sets: [targetForType(ExerciseType.SetsReps)],
  };
}

export function ExercisePrescriptionEditor({
  prescription: prescriptionProp,
  exerciseId,
  onChange,
  size = "default",
}: Props) {
  const prescription = prescriptionProp ?? defaultPrescription();
  const sets = normalizedSets(prescription);
  const isSm = size === "sm";

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
      if (setIndex !== index) return set;
      const t = set.target;
      return {
        ...set,
        target: {
          reps: t?.reps ?? null,
          durationSeconds: t?.durationSeconds ?? null,
          distanceMeters: t?.distanceMeters ?? null,
          weightKg: t?.weightKg ?? null,
          note: t?.note ?? null,
          ...patch,
        },
      };
    });
    onChange({ ...prescription, sets: nextSets });
  }

  function updateType(type: ExercisePrescription["type"]) {
    const sourceSet = sets[0];
    onChange({
      type,
      sets: [targetForType(type, sourceSet?.target)],
    });
  }

  function addSet() {
    const sourceSet = sets[sets.length - 1] ?? sets[0];
    onChange({
      ...prescription,
      sets: [...sets, targetForType(prescription.type, sourceSet?.target)],
    });
  }

  function removeSet(index: number) {
    const nextSets = sets.filter((_, i) => i !== index);
    if (!nextSets.length) return;
    onChange({ ...prescription, sets: nextSets });
  }

  return (
    <div className="space-y-2">
      <select
        value={prescription.type}
        onChange={(ev) => updateType(ev.target.value as ExercisePrescription["type"])}
        className={cn(
          "w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 text-[var(--shell-ink)]",
          isSm ? "h-8 text-xs" : "mb-2 py-2 text-sm",
        )}
      >
        <option value={ExerciseType.SetsReps}>Sets + reps</option>
        <option value={ExerciseType.DurationSeconds}>Static hold time</option>
        <option value={ExerciseType.DistanceMeters}>Distance</option>
      </select>

      <div className="space-y-2">
        {sets.map((set, setIndex) => (
          <div
            key={`${exerciseId}-set-${setIndex}`}
            className={cn(
              "rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)]",
              isSm ? "p-2" : "p-3",
            )}
          >
            <div className={cn("flex items-center justify-between", isSm ? "mb-1.5" : "mb-2")}>
              <p
                className={cn(
                  "font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]",
                  isSm ? "text-[10px]" : "text-[11px]",
                )}
              >
                Set {setIndex + 1}
              </p>
              <button
                type="button"
                onClick={() => removeSet(setIndex)}
                disabled={sets.length <= 1}
                className="inline-flex items-center gap-1 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1 text-[11px] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)] disabled:opacity-40"
              >
                <Trash2Icon className="h-3 w-3" />
                Remove
              </button>
            </div>

            <div className="space-y-2">
              {prescription.type === ExerciseType.SetsReps ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={1}
                      value={set.target?.reps ?? ""}
                      onChange={(ev) =>
                        patchSetTarget(setIndex, {
                          reps: ev.target.value ? Number(ev.target.value) : null,
                        })
                      }
                      className={cn(
                        "w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-10 text-[var(--shell-ink)]",
                        isSm ? "h-8 text-xs" : "py-1.5 text-sm",
                      )}
                      placeholder="0"
                      aria-label="Reps"
                    />
                    <span
                      className={cn(
                        "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--shell-muted)]",
                        isSm ? "text-[10px]" : "text-xs",
                      )}
                    >
                      reps
                    </span>
                  </div>
                  <div className="relative flex-1">
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
                      className={cn(
                        "w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-7 text-[var(--shell-ink)]",
                        isSm ? "h-8 text-xs" : "py-1.5 text-sm",
                      )}
                      placeholder="0"
                      aria-label="Target weight in kilograms"
                    />
                    <span
                      className={cn(
                        "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--shell-muted)]",
                        isSm ? "text-[10px]" : "text-xs",
                      )}
                    >
                      kg
                    </span>
                  </div>
                </div>
              ) : null}

              {prescription.type === ExerciseType.DurationSeconds ? (
                <div className="relative w-40">
                  <input
                    type="number"
                    min={1}
                    value={set.target?.durationSeconds ?? ""}
                    onChange={(ev) =>
                      patchSetTarget(setIndex, {
                        durationSeconds: ev.target.value ? Number(ev.target.value) : null,
                      })
                    }
                    className={cn(
                      "w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-7 text-[var(--shell-ink)]",
                      isSm ? "h-8 text-xs" : "py-1.5 text-sm",
                    )}
                    placeholder="0"
                    aria-label="Seconds"
                  />
                  <span
                    className={cn(
                      "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--shell-muted)]",
                      isSm ? "text-[10px]" : "text-xs",
                    )}
                  >
                    s
                  </span>
                </div>
              ) : null}

              {prescription.type === ExerciseType.DistanceMeters ? (
                <div className="relative w-40">
                  <input
                    type="number"
                    min={1}
                    value={set.target?.distanceMeters ?? ""}
                    onChange={(ev) =>
                      patchSetTarget(setIndex, {
                        distanceMeters: ev.target.value ? Number(ev.target.value) : null,
                      })
                    }
                    className={cn(
                      "w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] pl-2 pr-7 text-[var(--shell-ink)]",
                      isSm ? "h-8 text-xs" : "py-1.5 text-sm",
                    )}
                    placeholder="0"
                    aria-label="Meters"
                  />
                  <span
                    className={cn(
                      "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--shell-muted)]",
                      isSm ? "text-[10px]" : "text-xs",
                    )}
                  >
                    m
                  </span>
                </div>
              ) : null}

              <Textarea
                value={set.target?.note ?? ""}
                onChange={(ev) =>
                  patchSetTarget(setIndex, { note: ev.target.value || null })
                }
                className={cn(
                  "w-full resize-y rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 font-medium text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus-visible:ring-[var(--shell-accent)]",
                  isSm ? "min-h-16 text-xs" : "min-h-[84px] text-sm",
                )}
                placeholder="Set note (optional)"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addSet}
          className="inline-flex items-center gap-1 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)]"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Add set
        </button>
      </div>
    </div>
  );
}
