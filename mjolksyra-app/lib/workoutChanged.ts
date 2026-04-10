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

  const exercises = workout.draftExercises ?? workout.publishedExercises;
  const oldExercises = oldWorkout.draftExercises ?? oldWorkout.publishedExercises;

  if (exercises.length !== oldExercises.length) {
    return true;
  }

  const exerciseIdOrder = exercises.map((x) => x.id).join(",");
  const oldExerciseIdOrder = oldExercises.map((x) => x.id).join(",");
  if (exerciseIdOrder !== oldExerciseIdOrder) {
    return true;
  }

  for (const exercise of exercises) {
    const oldExercise = oldExercises.find((x) => x.id == exercise.id);

    if (!oldExercise) {
      return true;
    }

    const exerciseChecks = [
      exercise.id === oldExercise.id,
      exercise.exerciseId === oldExercise.exerciseId,
      exercise.name === oldExercise.name,
      exercise.note === oldExercise.note,
      exercise.isDone === oldExercise.isDone,
      exercise.prescription?.type === oldExercise.prescription?.type,
      JSON.stringify(exercise.prescription?.sets ?? null) ===
        JSON.stringify(oldExercise.prescription?.sets ?? null),
    ];

    if (exerciseChecks.some((x) => !x)) {
      return true;
    }
  }

  return false;
}
