import { ApiClient } from "../client";
import { workoutResponseSchema } from "./schema";

type Args = { traineeId: string; plannedWorkoutId: string };

export async function startWorkoutSession({ traineeId, plannedWorkoutId }: Args) {
  const url = `/api/trainees/${traineeId}/workouts`;
  const response = await ApiClient.post(url, { plannedWorkoutId });
  const parsed = await workoutResponseSchema.safeParseAsync(response.data);
  if (!parsed.success) throw new Error("Failed to parse data");
  return parsed.data;
}
