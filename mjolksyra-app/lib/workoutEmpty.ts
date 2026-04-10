import { PlannedWorkout } from "@/services/plannedWorkouts/type";

export function workoutEmpty(workout: PlannedWorkout) {
  const exercises = workout.draftExercises ?? workout.publishedExercises;
  if (exercises.length) {
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
