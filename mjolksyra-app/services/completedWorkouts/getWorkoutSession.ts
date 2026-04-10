import { ApiClient } from "../client";
import { workoutResponseSchema } from "./schema";

type Args = { traineeId: string; plannedWorkoutId: string };

export async function getWorkoutSession({ traineeId, plannedWorkoutId }: Args) {
  const url = `/api/trainees/${traineeId}/workouts/${plannedWorkoutId}`;
  const response = await ApiClient.get(url);
  if (!response.data) return null;
  const parsed = await workoutResponseSchema.safeParseAsync(response.data);
  if (!parsed.success) throw new Error("Failed to parse data");
  return parsed.data;
}
