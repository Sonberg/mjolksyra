import { ApiClient } from "../client";
import { workoutSchema } from "./schema";
import { paginated } from "../schema";
import { PlannedWorkout } from "./type";

type Args = {
  traineeId: string;
  signal?: AbortSignal;
};

export async function getSkippedWorkouts({ traineeId, signal }: Args): Promise<PlannedWorkout[]> {
  const response = await ApiClient.get(
    `/api/trainees/${traineeId}/planned-workouts?skippedOnly=true&limit=100&sortBy=PlannedAt&order=desc`,
    { signal }
  );

  const parsed = await paginated(workoutSchema).safeParseAsync(response.data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data.data;
}
