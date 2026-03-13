import { ExerciseType } from "@/lib/exercisePrescription";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";

export type WorkoutExercise = PlannedWorkout["exercises"][number];
export type WorkoutSet = NonNullable<
  NonNullable<WorkoutExercise["prescription"]>["sets"]
>[number];

export type ToggleExerciseDoneInput = {
  exerciseId: string;
  isDone: boolean;
};

export type ToggleSetDoneInput = {
  exerciseId: string;
  setIndex: number;
};

export type UpdateSetActualInput = {
  exerciseId: string;
  setIndex: number;
  weightKg: number | null;
  reps: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  note: string | null;
};

export type GetSetTargetLabel = (
  targetType: ExerciseType | undefined,
  target: {
    reps: number | null;
    durationSeconds: number | null;
    distanceMeters: number | null;
  } | null | undefined,
) => string;

