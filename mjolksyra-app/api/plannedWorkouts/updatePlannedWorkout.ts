import { ApiClient } from "../client";
import { PlannedWorkout } from "./type";

type Args = {
  plannedWorkout: PlannedWorkout;
};

export async function updatePlannedWorkout({ plannedWorkout }: Args) {
  const url = `/api/trainees/${plannedWorkout.traineeId}/planned-workouts(${plannedWorkout.id}`;
  const response = await ApiClient.put(url, plannedWorkout);

  if (response.status > 299) {
    throw new Error("Failed to parse data");
  }
}
