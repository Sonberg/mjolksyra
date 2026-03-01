import { PlannedWorkout } from "@/services/plannedWorkouts/type";

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
    workout.note === oldWorkout.note,
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
      exercise.isDone === oldExercise.isDone,
      exercise.prescription?.targetType === oldExercise.prescription?.targetType,
      exercise.prescription?.sets === oldExercise.prescription?.sets,
      exercise.prescription?.reps === oldExercise.prescription?.reps,
      exercise.prescription?.durationSeconds ===
        oldExercise.prescription?.durationSeconds,
      exercise.prescription?.distanceMeters ===
        oldExercise.prescription?.distanceMeters,
    ];

    if (exerciseChecks.some((x) => !x)) {
      return true;
    }
  }

  return false;
}
