import { ApiClient } from "../client";
import { workoutSchema } from "./schema";
import { PlannedWorkout } from "./type";

type Args = {
  plannedWorkout: PlannedWorkout;
};

export type CreatePlannedWorkout = typeof createPlannedWorkout;

export async function createPlannedWorkout({ plannedWorkout }: Args) {
  const url = `/api/trainees/${plannedWorkout.traineeId}/planned-workouts`;
  const response = await ApiClient.post(url, plannedWorkout);
  const parsed = await workoutSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error("Failed to parse data");
  }

  return parsed.data;
}
