import { ApiClient } from "../client";
import { completedWorkoutSchema } from "./schema";

type Args = {
  traineeId: string;
  plannedAt: string;
};

export async function createCompletedWorkout({ traineeId, plannedAt }: Args) {
  const response = await ApiClient.post(`/api/trainees/${traineeId}/workouts/ad-hoc`, {
    plannedAt,
  });

  const parsed = await completedWorkoutSchema.safeParseAsync(response.data);
  if (!parsed.success) {
    throw new Error("Failed to parse data");
  }

  return parsed.data;
}
