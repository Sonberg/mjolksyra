import { ApiClient } from "../client";
import { completedWorkoutSchema } from "./schema";

type Args = { traineeId: string; plannedWorkoutId: string };

export async function getWorkoutSession({ traineeId, plannedWorkoutId }: Args) {
  const url = `/api/trainees/${traineeId}/planned-workouts/${plannedWorkoutId}/session`;
  const response = await ApiClient.get(url);
  if (!response.data) return null;
  const parsed = await completedWorkoutSchema.safeParseAsync(response.data);
  if (!parsed.success) throw new Error("Failed to parse data");
  return parsed.data;
}
