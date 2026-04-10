import { ApiClient } from "../client";
import { workoutSchema } from "./schema";
import { PlannedWorkout } from "./type";

type Args = {
  traineeId: string;
  plannedWorkoutId: string;
};

export type PublishDraftExercises = typeof publishDraftExercises;

export async function publishDraftExercises({
  traineeId,
  plannedWorkoutId,
}: Args): Promise<PlannedWorkout> {
  const url = `/api/trainees/${traineeId}/planned-workouts/${plannedWorkoutId}/exercises/publish`;
  const response = await ApiClient.post(url);
  const parsed = await workoutSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error("Failed to parse data");
  }

  return parsed.data;
}
