import { v4 } from "uuid";
import { AddExerciseAction } from "../parse";
import { TransformResult } from "./";
import { PLANNED_AT } from "@/constants/dateFormats";
import { inferPrescriptionFromType, ExerciseType } from "@/lib/exercisePrescription";

export function addFromLibrary(traineeId: string, action: AddExerciseAction) {
  const workoutExists = (): TransformResult => {
    const targetDraft = action.targetWorkout!.draftExercises ?? action.targetWorkout!.publishedExercises;
    return {
      create: [],
      delete: [],
      update: [
        {
          ...action.targetWorkout!,
          draftExercises: [
            ...targetDraft,
            {
              id: v4(),
              exerciseId: action.exercise.id,
              name: action.exercise.name,
              note: "",
              isPublished: false,
              isDone: false,
              addedBy: null,
              prescription: inferPrescriptionFromType(action.exercise.type as ExerciseType | null | undefined),
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
          appliedBlock: null,
          publishedExercises: [],
          draftExercises: [
            {
              id: v4(),
              exerciseId: action.exercise.id,
              name: action.exercise.name,
              note: "",
              isPublished: false,
              isDone: false,
              addedBy: null,
              prescription: inferPrescriptionFromType(action.exercise.type as ExerciseType | null | undefined),
            },
          ],
        },
      ],
    };
  };

  return action.targetWorkout ? workoutExists() : workoutMissing();
}
