import { ExerciseType } from "@/lib/exercisePrescription";
import { PlannedExercise } from "@/services/plannedWorkouts/type";
import { CompletedExercise } from "@/services/completedWorkouts/type";

export type WorkoutExercise = (PlannedExercise | CompletedExercise) & {
  addedBy?: "Coach" | "Athlete" | null;
};
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

export type RemoveSetRowInput = {
  exerciseId: string;
  setIndex: number;
};


