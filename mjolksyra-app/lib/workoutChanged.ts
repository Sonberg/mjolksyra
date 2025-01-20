import { PlannedWorkout } from "@/api/plannedWorkouts/type";

export function workoutChanged(
  workout: PlannedWorkout,
  oldState: PlannedWorkout[]
) {
  const oldWorkout = oldState.find((x) => x.id == workout.id);

  if (!oldWorkout) {
    return true;
  }

  const workoutChecks = [
    workout.name === oldWorkout.name,
    workout.note === oldWorkout.name,
    workout.plannedAt === oldWorkout.plannedAt,
  ];

  if (workoutChecks.some((x) => !x)) {
    return true;
  }

  if (workout.exercises.length !== oldWorkout.exercises.length) {
    return true;
  }

  for (const exercise of workout.exercises) {
    const oldExercise = oldWorkout.exercises.find((x) => x.id == exercise.id);

    if (!oldExercise) {
      return true;
    }

    const exerciseChecks = [
      exercise.id === oldExercise.id,
      exercise.exerciseId === oldExercise.exerciseId,
      exercise.name === oldExercise.name,
      exercise.note === oldExercise.note,
    ];

    if (exerciseChecks.some((x) => !x)) {
      return true;
    }
  }

  return false;
}
