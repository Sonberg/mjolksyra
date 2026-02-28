import { ApiClient } from "../client";
import { workoutSchema } from "./schema";

type Args = {
  traineeId: string;
  plannedWorkoutId: string;
  signal?: AbortSignal;
};

export async function getPlannedWorkoutById({
  traineeId,
  plannedWorkoutId,
  signal,
}: Args) {
  const response = await ApiClient.get(
    `/api/trainees/${traineeId}/planned-workouts/${plannedWorkoutId}`,
    {
      signal,
    },
  );

  const parsed = await workoutSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
