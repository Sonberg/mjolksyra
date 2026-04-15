import { ApiClient } from "../client";
import { workoutSchema } from "./schema";
import { PlannedWorkout } from "./type";

type Args = {
  traineeId: string;
  plannedWorkoutId: string;
};

export async function skipPlannedWorkout({ traineeId, plannedWorkoutId }: Args): Promise<PlannedWorkout> {
  const response = await ApiClient.post(
    `/api/trainees/${traineeId}/planned-workouts/${plannedWorkoutId}/skip`,
    {}
  );

  const parsed = await workoutSchema.safeParseAsync(response.data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
