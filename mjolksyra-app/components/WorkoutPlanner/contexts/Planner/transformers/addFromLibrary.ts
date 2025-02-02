import { v4 } from "uuid";
import { AddExerciseAction } from "../parse";
import { TransformResult } from "./";
import { PLANNED_AT } from "@/constants/dateFormats";

export function addFromLibrary(traineeId: string, action: AddExerciseAction) {
  const workoutExists = (): TransformResult => {
    return {
      create: [],
      delete: [],
      update: [
        {
          ...action.targetWorkout!,
          exercises: [
            ...action.targetWorkout!.exercises,
            {
              id: v4(),
              exerciseId: action.exercise.id,
              name: action.exercise.name,
              note: "",
              images: []
            },
          ],
        },
      ],
    };
  };

  const workoutMissing = (): TransformResult => {
    return {
      update: [],
      delete: [],
      create: [
        {
          id: v4(),
          traineeId,
          name: null,
          note: null,
          createdAt: null,
          plannedAt: action.targetDate.format(PLANNED_AT),
          exercises: [
            {
              id: v4(),
              exerciseId: action.exercise.id,
              name: action.exercise.name,
              note: "",
              images: []
            },
          ],
        },
      ],
    };
  };

  return action.targetWorkout ? workoutExists() : workoutMissing();
}
