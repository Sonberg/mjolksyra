import { PlannedExercise, PlannedWorkout } from "@/services/plannedWorkouts/type";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useMemo } from "react";
import { useWorkouts } from "../Workouts";
import { monthId } from "@/lib/monthId";
import { arrayMove } from "@dnd-kit/sortable";
import {
  ExercisePrescription,
  ExercisePrescriptionTargetType,
} from "@/lib/exercisePrescription";

type Props = {
  plannedExercise: PlannedExercise;
  plannedWorkout: PlannedWorkout;
  update: (_: PlannedWorkout) => void;
};

export function WorkoutEditorExercise({
  plannedExercise,
  plannedWorkout,
  update,
}: Props) {
  const { dispatch } = useWorkouts();
  const index = useMemo(
    () =>
      plannedWorkout.exercises.findIndex((x) => x.id === plannedExercise.id),
    [plannedExercise, plannedWorkout]
  );

  const canMoveUp = index !== 0;
  const canMoveDown = index !== plannedWorkout.exercises.length - 1;

  async function onMoveUp() {
    const updatedWorkout = {
      ...plannedWorkout,
      exercises: arrayMove(plannedWorkout.exercises, index, index - 1),
    };

    update(updatedWorkout);
    dispatch({
      type: "SET_WORKOUT",
      payload: {
        monthId: monthId(plannedWorkout.plannedAt),
        plannedWorkout: updatedWorkout,
      },
    });
  }

  async function onMoveDown() {
    const updatedWorkout = {
      ...plannedWorkout,
      exercises: arrayMove(plannedWorkout.exercises, index, index + 1),
    };

    update(updatedWorkout);
    dispatch({
      type: "SET_WORKOUT",
      payload: {
        monthId: monthId(plannedWorkout.plannedAt),
        plannedWorkout: updatedWorkout,
      },
    });
  }

  async function onUpdateNote(value: string) {
    const updatedWorkout = {
      ...plannedWorkout,
      exercises: plannedWorkout.exercises.map((x) =>
        x.id == plannedExercise.id
          ? {
              ...x,
              note: value,
            }
          : x
      ),
    };
    update(updatedWorkout);
    dispatch({
      type: "SET_WORKOUT",
      payload: {
        monthId: monthId(plannedWorkout.plannedAt),
        plannedWorkout: updatedWorkout,
      },
    });
  }

  async function onUpdatePrescription(prescription: ExercisePrescription | null) {
    const updatedWorkout = {
      ...plannedWorkout,
      exercises: plannedWorkout.exercises.map((x) =>
        x.id == plannedExercise.id
          ? {
              ...x,
              prescription,
            }
          : x
      ),
    };
    update(updatedWorkout);
    dispatch({
      type: "SET_WORKOUT",
      payload: {
        monthId: monthId(plannedWorkout.plannedAt),
        plannedWorkout: updatedWorkout,
      },
    });
  }

  const prescription = plannedExercise.prescription ?? {
    targetType: ExercisePrescriptionTargetType.SetsReps,
    sets: [
      { target: { reps: null, durationSeconds: null, distanceMeters: null, weightKg: null, note: null }, actual: null },
    ],
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

  function normalizedSets() {
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

  const sets = normalizedSets();

  function patchSetTarget(
    index: number,
    patch: Partial<{ reps: number | null; durationSeconds: number | null; distanceMeters: number | null; weightKg: number | null; note: string | null }>,
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
    onUpdatePrescription({
      ...prescription,
      sets: nextSets,
    });
  }

  function addSet() {
    const sourceSet = sets[sets.length - 1] ?? sets[0];
    const nextSet = targetForType(prescription.targetType, sourceSet?.target);

    const nextSets = [...sets, nextSet];
    onUpdatePrescription({
      ...prescription,
      sets: nextSets,
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
    <div>
      <div className="flex justify-between items-center mb-4 ">
        <div className="font-bold">
          {index + 1}.{"  "}
          {plannedExercise.name}
        </div>
        <div className="flex">
          <div
            onClick={onMoveUp}
            className={cn({
              "rounded p-1 ": true,
              "hover:bg-accent cursor-pointer": canMoveUp,
              "text-accent-foreground/40": !canMoveUp,
            })}
          >
            <ArrowUpIcon className="h-5" />
          </div>
          <div
            onClick={onMoveDown}
            className={cn({
              "rounded p-1 ": true,
              "hover:bg-accent cursor-pointer": canMoveDown,
              "text-accent-foreground/40": !canMoveDown,
            })}
          >
            <ArrowDownIcon className="h-5" />
          </div>
        </div>
      </div>
      <Textarea
        className="mt-4"
        value={plannedExercise.note ?? ""}
        onChange={(ev) => onUpdateNote(ev.target.value)}
      />
      <div className="mt-4 space-y-2 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          Target
        </p>
        <select
          value={prescription.targetType}
          onChange={(ev) => {
            const targetType = ev.target.value as ExercisePrescription["targetType"];
            const sourceSet = sets[0];
            const setsForType = [targetForType(targetType, sourceSet?.target)];

            onUpdatePrescription({
              targetType,
              sets: setsForType,
            });
          }}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
        >
          <option value={ExercisePrescriptionTargetType.SetsReps}>Sets + reps</option>
          <option value={ExercisePrescriptionTargetType.DurationSeconds}>Static hold time</option>
          <option value={ExercisePrescriptionTargetType.DistanceMeters}>Distance</option>
        </select>
        <div className="space-y-2">
          {sets.map((set, setIndex) => (
            <div key={`${plannedExercise.id}-set-${setIndex}`} className="rounded border border-zinc-800 bg-zinc-900/30 p-2">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                  Set {setIndex + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeSet(setIndex)}
                  disabled={sets.length <= 1}
                  className="inline-flex items-center gap-1 rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 disabled:opacity-40"
                >
                  <Trash2Icon className="h-3 w-3" />
                  Remove
                </button>
              </div>

              <div className="space-y-2">
                {prescription.targetType === ExercisePrescriptionTargetType.SetsReps ? (
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
                        className="w-full rounded border border-zinc-700 bg-zinc-900 pl-2 pr-10 py-1 text-sm"
                        placeholder="0"
                        aria-label="Reps"
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">reps</span>
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
                        className="w-full rounded border border-zinc-700 bg-zinc-900 pl-2 pr-7 py-1 text-sm"
                        placeholder="0"
                        aria-label="Target weight in kilograms"
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">kg</span>
                    </div>
                  </div>
                ) : null}

                {prescription.targetType === ExercisePrescriptionTargetType.DurationSeconds ? (
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
                      className="w-full rounded border border-zinc-700 bg-zinc-900 pl-2 pr-7 py-1 text-sm"
                      placeholder="0"
                      aria-label="Seconds"
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">s</span>
                  </div>
                ) : null}

                {prescription.targetType === ExercisePrescriptionTargetType.DistanceMeters ? (
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
                      className="w-full rounded border border-zinc-700 bg-zinc-900 pl-2 pr-7 py-1 text-sm"
                      placeholder="0"
                      aria-label="Meters"
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">m</span>
                  </div>
                ) : null}

                <Textarea
                  value={set.target?.note ?? ""}
                  onChange={(ev) =>
                    patchSetTarget(setIndex, {
                      note: ev.target.value || null,
                    })
                  }
                  className="min-h-[72px] w-full resize-y rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
                  placeholder="Set note (optional)"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addSet}
            className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-semibold text-zinc-100"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Add set
          </button>
        </div>
      </div>
    </div>
  );
}
