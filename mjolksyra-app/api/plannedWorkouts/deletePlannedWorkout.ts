import { ApiClient } from "../client";
import { PlannedWorkout } from "./type";

type Args = {
  plannedWorkout: PlannedWorkout;
};

export async function deletePlannedWorkout({ plannedWorkout }: Args) {
  await ApiClient.delete(
    `/api/trainees/${plannedWorkout.traineeId}/planned-workouts/${plannedWorkout.id}`
  );
}
