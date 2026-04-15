import { ApiClient } from "../client";
import { completedWorkoutSchema } from "./schema";

type Args = { traineeId: string; workoutId: string };

export async function restoreWorkoutSession({ traineeId, workoutId }: Args) {
  const url = `/api/trainees/${traineeId}/workouts/${workoutId}/restore`;
  const response = await ApiClient.post(url, {});
  const parsed = await completedWorkoutSchema.safeParseAsync(response.data);
  if (!parsed.success) throw new Error("Failed to parse data");
  return parsed.data;
}
