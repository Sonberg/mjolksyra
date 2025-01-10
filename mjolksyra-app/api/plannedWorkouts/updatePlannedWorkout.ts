import { ApiClient } from "../client";
import { workoutSchema } from "./schema";
import { PlannedWorkout } from "./type";

type Args = {
  plannedWorkout: PlannedWorkout;
};

export async function updatePlannedWorkout({ plannedWorkout }: Args) {
  const url = `/api/trainees/${plannedWorkout.traineeId}/planned-workouts/${plannedWorkout.id}`;
  const response = await ApiClient.put(url, plannedWorkout);
  const parsed = await workoutSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error("Failed to parse data");
  }

  return parsed.data;
}
