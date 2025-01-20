import { PlannedWorkout } from "@/api/plannedWorkouts/type";

export function workoutEmpty(workout: PlannedWorkout) {
  if (workout.exercises.length) {
    return false;
  }

  if (workout.name) {
    return false;
  }

  if (workout.note) {
    return false;
  }

  return true;
}
