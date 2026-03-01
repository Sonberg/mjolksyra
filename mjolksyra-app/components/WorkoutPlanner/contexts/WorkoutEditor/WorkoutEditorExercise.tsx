import { PlannedExercise, PlannedWorkout } from "@/services/plannedWorkouts/type";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useMemo } from "react";
import { useWorkouts } from "../Workouts";
import { monthId } from "@/lib/monthId";
import { arrayMove } from "@dnd-kit/sortable";
import { ExercisePrescription } from "@/lib/exercisePrescription";

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
    targetType: "sets_reps" as const,
    setTargets: [
      { reps: 8, durationSeconds: null, distanceMeters: null, note: null },
      { reps: 8, durationSeconds: null, distanceMeters: null, note: null },
      { reps: 8, durationSeconds: null, distanceMeters: null, note: null },
    ],
  };

  function targetForType(
    targetType: ExercisePrescription["targetType"],
    source?: {
      reps: number | null;
      durationSeconds: number | null;
      distanceMeters: number | null;
      note: string | null;
    },
  ) {
    if (targetType === "sets_reps") {
      return {
        reps: source?.reps ?? 8,
        durationSeconds: null,
        distanceMeters: null,
        note: source?.note ?? null,
      };
    }

    if (targetType === "duration_seconds") {
      return {
        reps: null,
        durationSeconds: source?.durationSeconds ?? 30,
        distanceMeters: null,
        note: source?.note ?? null,
      };
    }

    return {
      reps: null,
      durationSeconds: null,
      distanceMeters: source?.distanceMeters ?? 1000,
      note: source?.note ?? null,
    };
  }

  function normalizedTargets() {
    if (prescription.setTargets?.length) {
      return prescription.setTargets;
    }

    if (prescription.targetType === "sets_reps") {
      return Array.from({ length: 3 }, () =>
        targetForType("sets_reps"),
      );
    }

    if (prescription.targetType === "duration_seconds") {
      return [targetForType("duration_seconds")];
    }

    return [targetForType("distance_meters")];
  }

  const setTargets = normalizedTargets();

  function patchSetTarget(
    index: number,
    patch: Partial<(typeof setTargets)[number]>,
  ) {
    const nextTargets = setTargets.map((target, targetIndex) =>
      targetIndex === index ? { ...target, ...patch } : target,
    );
    onUpdatePrescription({
      ...prescription,
      setTargets: nextTargets,
    });
  }

  function addSetTarget() {
    const sourceTarget = setTargets[setTargets.length - 1] ?? setTargets[0];
    const nextTarget = targetForType(prescription.targetType, sourceTarget);

    const nextTargets = [...setTargets, nextTarget];
    onUpdatePrescription({
      ...prescription,
      setTargets: nextTargets,
    });
  }

  function removeSetTarget(index: number) {
    const nextTargets = setTargets.filter((_, targetIndex) => targetIndex !== index);
    if (!nextTargets.length) {
      return;
    }

    onUpdatePrescription({
      ...prescription,
      setTargets: nextTargets,
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
            const sourceTarget = setTargets[0];
            const setTargetsForType =
              targetType === "sets_reps"
                ? [targetForType(targetType, sourceTarget), targetForType(targetType, sourceTarget), targetForType(targetType, sourceTarget)]
                : [targetForType(targetType, sourceTarget)];

            onUpdatePrescription({
              targetType,
              setTargets: setTargetsForType,
            });
          }}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
        >
          <option value="sets_reps">Sets + reps</option>
          <option value="duration_seconds">Static hold time</option>
          <option value="distance_meters">Distance</option>
        </select>
        <p className="text-[11px] text-zinc-500">
          Time is entered in seconds (s), distance in meters (m).
        </p>

        <div className="space-y-2">
          {setTargets.map((target, targetIndex) => (
            <div key={`${plannedExercise.id}-set-${targetIndex}`} className="rounded border border-zinc-800 bg-zinc-900/30 p-2">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                  Set {targetIndex + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeSetTarget(targetIndex)}
                  disabled={setTargets.length <= 1}
                  className="inline-flex items-center gap-1 rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 disabled:opacity-40"
                >
                  <Trash2Icon className="h-3 w-3" />
                  Remove
                </button>
              </div>

              <div className="space-y-2">
                {prescription.targetType === "sets_reps" ? (
                  <input
                    type="number"
                    min={1}
                    value={target.reps ?? ""}
                    onChange={(ev) =>
                      patchSetTarget(targetIndex, {
                        reps: ev.target.value ? Number(ev.target.value) : null,
                      })
                    }
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
                    placeholder="Reps"
                    aria-label="Reps"
                  />
                ) : null}

                {prescription.targetType === "duration_seconds" ? (
                  <input
                    type="number"
                    min={1}
                    value={target.durationSeconds ?? ""}
                    onChange={(ev) =>
                      patchSetTarget(targetIndex, {
                        durationSeconds: ev.target.value ? Number(ev.target.value) : null,
                      })
                    }
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
                    placeholder="Seconds (s)"
                    aria-label="Seconds"
                  />
                ) : null}

                {prescription.targetType === "distance_meters" ? (
                  <input
                    type="number"
                    min={1}
                    value={target.distanceMeters ?? ""}
                    onChange={(ev) =>
                      patchSetTarget(targetIndex, {
                        distanceMeters: ev.target.value ? Number(ev.target.value) : null,
                      })
                    }
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
                    placeholder="Meters (m)"
                    aria-label="Meters"
                  />
                ) : null}

                <Textarea
                  value={target.note ?? ""}
                  onChange={(ev) =>
                    patchSetTarget(targetIndex, {
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
            onClick={addSetTarget}
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
