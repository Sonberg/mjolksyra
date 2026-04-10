import { ApiClient } from "../client";
import { completedWorkoutSchema } from "./schema";

type Args = { traineeId: string; completedWorkoutId: string; signal?: AbortSignal };

export async function getWorkoutSession({ traineeId, completedWorkoutId, signal }: Args) {
  const url = `/api/trainees/${traineeId}/workouts/${completedWorkoutId}`;
  const response = await ApiClient.get(url, { signal });
  if (!response.data) return null;
  const parsed = await completedWorkoutSchema.safeParseAsync(response.data);
  if (!parsed.success) throw new Error("Failed to parse data");
  return parsed.data;
}
