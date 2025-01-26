import { ReactNode, useMemo } from "react";
import { useWorkoutEditor } from "./WorkoutEditorContext";
import { useWorkouts } from "../Workouts";
import { Spinner } from "@/components/Spinner";
import { WorkoutEditorExercise } from "./WorkoutEditorExercise";

export function WorkoutEditor({ children }: { children: ReactNode }) {
  const { data } = useWorkouts();
  const { plannedWorkoutId, close } = useWorkoutEditor();

  const plannedWorkout = useMemo(() => {
    if (!plannedWorkoutId) {
      return null;
    }

    return Object.values(data)
      .flatMap((x) => x)
      .find((x) => x.id == plannedWorkoutId);
  }, [data, plannedWorkoutId]);

  if (!plannedWorkout) {
    return children;
  }
  return (
    <div>
      <div className="flex items-center gap-4 justify-between border-b px-6 py-6">
        <div className="font-bold text-2xl flex items-center gap-4">
          {plannedWorkout.plannedAt} <Spinner size={12} />
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
          />
        ))}
      </div>
    </div>
  );
}
