import { PlannedExercise, PlannedWorkout } from "@/api/plannedWorkouts/type";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { useWorkouts } from "../Workouts";
import { monthId } from "@/lib/monthId";

type Props = {
  plannedExercise: PlannedExercise;
  plannedWorkout: PlannedWorkout;
};

export function WorkoutEditorExercise({
  plannedExercise,
  plannedWorkout,
}: Props) {
  const [note, setNote] = useState(plannedExercise.note ?? "");
  const { dispatch } = useWorkouts();
  const index = useMemo(
    () =>
      plannedWorkout.exercises.findIndex((x) => x.id === plannedExercise.id),
    [plannedExercise, plannedWorkout]
  );

  const canMoveUp = index !== 0;
  const canMoveDown = index !== plannedWorkout.exercises.length - 1;

  //   const updateNote = useDebounce((note: string) => {
  //     // update({
  //     //   ...plannedWorkout,
  //     //   exercises: plannedWorkout.exercises.map((x) =>
  //     //     x.id == plannedExercise.id
  //     //       ? {
  //     //           ...x,
  //     //           note,
  //     //         }
  //     //       : x
  //     //   ),
  //     // });
  //   }, 1000);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="font-bold mb-4">
          {index + 1}.{"  "}
          {plannedExercise.name}
        </div>
        <div className="flex gap-2 ">
          <div
            className={cn({
              "rounded p-1 ": true,
              "hover:bg-accent cursor-pointer": canMoveUp,
              "text-accent-foreground/40": !canMoveUp,
            })}
            onClick={() => {
              dispatch({
                type: "MOVE_EXERCISE",
                payload: {
                  plannedExerciseId: plannedExercise.id,
                  plannedWorkoutId: plannedWorkout.id,
                  index: index - 1,
                  monthId: monthId(plannedWorkout.plannedAt),
                },
              });
            }}
          >
            <ArrowUpIcon className="h-5" />
          </div>
          <div
            className={cn({
              "rounded p-1 ": true,
              "hover:bg-accent cursor-pointer": canMoveDown,
              "text-accent-foreground/40": !canMoveDown,
            })}
            onClick={() => {
              dispatch({
                type: "MOVE_EXERCISE",
                payload: {
                  plannedExerciseId: plannedExercise.id,
                  plannedWorkoutId: plannedWorkout.id,
                  index: index + 1,
                  monthId: monthId(plannedWorkout.plannedAt),
                },
              });
            }}
          >
            <ArrowDownIcon className="h-5" />
          </div>
        </div>
      </div>
      <Textarea value={note} onChange={(ev) => setNote(ev.target.value)} />
    </div>
  );
}
