import { PlannedExercise, PlannedWorkout } from "@/api/plannedWorkouts/type";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useMemo } from "react";
import { useWorkouts } from "../Workouts";
import { monthId } from "@/lib/monthId";
import { arrayMove } from "@dnd-kit/sortable";

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
        value={plannedExercise.note ?? ""}
        onChange={(ev) => onUpdateNote(ev.target.value)}
      />
    </div>
  );
}
