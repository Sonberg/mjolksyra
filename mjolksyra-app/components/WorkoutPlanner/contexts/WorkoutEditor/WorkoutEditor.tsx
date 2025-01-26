import { ReactNode, useMemo } from "react";
import { useWorkoutEditor } from "./WorkoutEditorContext";
import { useWorkouts } from "../Workouts";
import { WorkoutEditorExercise } from "./WorkoutEditorExercise";
import { PlannedWorkout } from "@/api/plannedWorkouts/type";
import { useDebounce } from "@/hooks/useDebounce";
import { usePlannedWorkoutActions } from "../PlannedWorkoutActions";
import dayjs from "dayjs";

export function WorkoutEditor({ children }: { children: ReactNode }) {
  const { data } = useWorkouts();
  const { plannedWorkoutId, close } = useWorkoutEditor();
  const { update } = usePlannedWorkoutActions();

  const plannedWorkout = useMemo(() => {
    if (!plannedWorkoutId) {
      return null;
    }

    return Object.values(data)
      .flatMap((x) => x)
      .find((x) => x.id == plannedWorkoutId);
  }, [data, plannedWorkoutId]);

  const updateDebounce = useDebounce(async (plannedWorkout: PlannedWorkout) => {
    await update({ plannedWorkout });
  }, 600);

  if (!plannedWorkout) {
    return children;
  }
  return (
    <div>
      <div className="flex items-center gap-4 justify-between border-b px-6 py-6">
        <div className="font-bold text-2xl flex items-center gap-4">
          {dayjs(plannedWorkout.plannedAt).format("MMMM D, YYYY")}
        </div>
        <div>
          <button
            style={{ fontSize: "0.75rem" }}
            className="py-1 px-3 bg-accent  hover:bg-accent-foreground hover:text-accent rounded-full"
            onClick={close}
          >
            Close
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-8 px-6 py-8">
        {plannedWorkout.exercises.map((x) => (
          <WorkoutEditorExercise
            key={x.id}
            plannedExercise={x}
            plannedWorkout={plannedWorkout}
            update={updateDebounce}
          />
        ))}
      </div>
    </div>
  );
}
