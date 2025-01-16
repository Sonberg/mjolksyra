import { v4 } from "uuid";
import { MoveExerciseAction } from "../parse";
import { TransformResult } from "./";
import { PLANNED_AT } from "@/constants/dateFormats";
import { insertAt } from "@/lib/insertAt";

export function moveExercise(traineeId: string, action: MoveExerciseAction) {
  const sourceWorkout = action.sourceWorkout;
  const targetWorkout = action.targetWorkout;
  const existingExercise = sourceWorkout!.exercises.find(
    (x) => x.id === action.plannedExercise.id
  )!;

  const exercise = {
    ...existingExercise,
    id: v4(),
  };

  const updateSourceWorkout = action.clone
    ? sourceWorkout
    : {
        ...sourceWorkout,
        exercises: sourceWorkout.exercises.filter(
          (x) => x.id !== existingExercise.id
        ),
      };

  const targetExists = (): TransformResult => {
    const updatedTargetWorkout = {
      ...targetWorkout!,
      exercises: insertAt(
        targetWorkout!.exercises.filter((x) => x.id !== existingExercise.id),
        action.index,
        exercise
      ),
    };

    if (targetWorkout!.id === sourceWorkout.id) {
      return {
        create: [],
        delete: [],
        update: [updatedTargetWorkout],
      };
    } else {
      return {
        create: [],
        delete: [],
        update: [updateSourceWorkout, updatedTargetWorkout],
      };
    }
  };

  const targetMissing = (): TransformResult => {
    return {
      create: [
        {
          id: v4(),
          traineeId,
          name: null,
          note: null,
          plannedAt: action.targetDate.format(PLANNED_AT),
          exercises: [exercise],
        },
      ],
      update: [updateSourceWorkout],
      delete: [],
    };
  };

  return action.targetWorkout ? targetExists() : targetMissing();
}
