import { ApiClient } from "../client";
import { workoutSchema } from "./schema";

type ExercisePrescriptionSetActualPayload = {
  reps: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  note: string | null;
  isDone: boolean;
};

type PlannedExerciseLogPayload = {
  id: string;
  sets: ExercisePrescriptionSetActualPayload[];
};

type LogPlannedWorkoutPayload = {
  completedAt: Date | null | undefined;
  mediaUrls: string[];
  exercises: PlannedExerciseLogPayload[];
};

type Args = {
  traineeId: string;
  plannedWorkoutId: string;
  log: LogPlannedWorkoutPayload;
};

export async function logPlannedWorkout({ traineeId, plannedWorkoutId, log }: Args) {
  const url = `/api/trainees/${traineeId}/planned-workouts/${plannedWorkoutId}/log`;
  const response = await ApiClient.put(url, log);
  const parsed = await workoutSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error("Failed to parse data");
  }

  return parsed.data;
}
