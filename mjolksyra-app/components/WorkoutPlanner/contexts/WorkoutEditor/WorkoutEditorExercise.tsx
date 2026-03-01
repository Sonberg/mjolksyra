import { PlannedExercise, PlannedWorkout } from "@/services/plannedWorkouts/type";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
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
    sets: 3,
    reps: 8,
    durationSeconds: null,
    distanceMeters: null,
  };

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
          onChange={(ev) =>
            onUpdatePrescription({
              targetType: ev.target.value as ExercisePrescription["targetType"],
              sets: ev.target.value === "sets_reps" ? prescription.sets ?? 3 : null,
              reps: ev.target.value === "sets_reps" ? prescription.reps ?? 8 : null,
              durationSeconds:
                ev.target.value === "duration_seconds"
                  ? prescription.durationSeconds ?? 30
                  : null,
              distanceMeters:
                ev.target.value === "distance_meters"
                  ? prescription.distanceMeters ?? 1000
                  : null,
            })
          }
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
        >
          <option value="sets_reps">Sets + reps</option>
          <option value="duration_seconds">Static hold time</option>
          <option value="distance_meters">Distance</option>
        </select>

        {prescription.targetType === "sets_reps" ? (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              value={prescription.sets ?? ""}
              onChange={(ev) =>
                onUpdatePrescription({
                  ...prescription,
                  sets: ev.target.value ? Number(ev.target.value) : null,
                })
              }
              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
              placeholder="Sets"
            />
            <input
              type="number"
              min={1}
              value={prescription.reps ?? ""}
              onChange={(ev) =>
                onUpdatePrescription({
                  ...prescription,
                  reps: ev.target.value ? Number(ev.target.value) : null,
                })
              }
              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
              placeholder="Reps"
            />
          </div>
        ) : null}

        {prescription.targetType === "duration_seconds" ? (
          <input
            type="number"
            min={1}
            value={prescription.durationSeconds ?? ""}
            onChange={(ev) =>
              onUpdatePrescription({
                ...prescription,
                durationSeconds: ev.target.value ? Number(ev.target.value) : null,
              })
            }
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
            placeholder="Time in seconds"
          />
        ) : null}

        {prescription.targetType === "distance_meters" ? (
          <input
            type="number"
            min={1}
            value={prescription.distanceMeters ?? ""}
            onChange={(ev) =>
              onUpdatePrescription({
                ...prescription,
                distanceMeters: ev.target.value ? Number(ev.target.value) : null,
              })
            }
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
            placeholder="Distance in meters"
          />
        ) : null}
      </div>
    </div>
  );
}
