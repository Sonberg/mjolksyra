import { ApiClient } from "../client";
import { PlannedWorkout } from "./type";

type Args = {
  plannedWorkout: PlannedWorkout;
};

export async function createPlannedWorkout({ plannedWorkout }: Args) {
  const url = `/api/trainees/${plannedWorkout.traineeId}/planned-workouts`;
  const response = await ApiClient.post(url, plannedWorkout);

  if (response.status > 299) {
    throw new Error("Failed to parse data");
  }
}
