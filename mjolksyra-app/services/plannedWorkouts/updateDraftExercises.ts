import { ApiClient } from "../client";
import { workoutSchema } from "./schema";
import { PlannedExercise, PlannedWorkout } from "./type";

type Args = {
  traineeId: string;
  plannedWorkoutId: string;
  exercises: PlannedExercise[];
};

export async function updateDraftExercises({
  traineeId,
  plannedWorkoutId,
  exercises,
}: Args): Promise<PlannedWorkout> {
  const url = `/api/trainees/${traineeId}/planned-workouts/${plannedWorkoutId}/exercises/draft`;
  const response = await ApiClient.put(url, { exercises });
  const parsed = await workoutSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error("Failed to parse data");
  }

  return parsed.data;
}
