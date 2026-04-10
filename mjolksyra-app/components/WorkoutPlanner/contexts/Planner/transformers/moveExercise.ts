import { v4 } from "uuid";
import { MoveExerciseAction } from "../parse";
import { TransformResult } from "./";
import { PLANNED_AT } from "@/constants/dateFormats";
import { insertAt } from "@/lib/insertAt";

export function moveExercise(traineeId: string, action: MoveExerciseAction) {
  const sourceWorkout = action.sourceWorkout;
  const targetWorkout = action.targetWorkout;
  const sourceDraft = sourceWorkout!.draftExercises ?? sourceWorkout!.publishedExercises;
  const existingExercise = sourceDraft.find(
    (x) => x.id === action.plannedExercise.id,
  )!;

  const exercise = {
    ...existingExercise,
    id: v4(),
  };

  const updateSourceWorkout = action.clone
    ? sourceWorkout
    : {
        ...sourceWorkout,
        draftExercises: sourceDraft.filter(
          (x) => x.id !== existingExercise.id,
        ),
      };

  const targetExists = (): TransformResult => {
    const targetDraft = targetWorkout!.draftExercises ?? targetWorkout!.publishedExercises;
    const updatedTargetWorkout = {
      ...targetWorkout!,
      draftExercises: insertAt(
        targetDraft.filter((x) => x.id !== existingExercise.id),
        action.index,
        exercise,
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
          publishedExercises: [],
          draftExercises: [exercise],
          appliedBlock: null,
          createdAt: null,
        },
      ],
      update: [updateSourceWorkout],
      delete: [],
    };
  };

  return action.targetWorkout ? targetExists() : targetMissing();
}
