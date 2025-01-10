import { PlannedWorkout } from "@/api/plannedWorkouts/type";
import { Action, AddExerciseAction, MoveExerciseAction } from "./parse";
import { v4 } from "uuid";
import { insertAt } from "@/lib/insertAt";
import { PLANNED_AT } from "@/constants/dateFormats";

export type TransformResult = {
  create: PlannedWorkout[];
  update: PlannedWorkout[];
};

function add(traineeId: string, action: AddExerciseAction): TransformResult {
  if (action.targetWorkout) {
    return {
      create: [],
      update: [
        {
          ...action.targetWorkout,
          exercises: [
            ...action.targetWorkout.exercises,
            {
              id: v4(),
              exerciseId: action.exercise.id,
              name: action.exercise.name,
              note: "",
            },
          ],
        },
      ],
    };
  } else {
    return {
      update: [],
      create: [
        {
          id: v4(),
          traineeId,
          name: null,
          note: null,
          plannedAt: action.targetDate.format(PLANNED_AT),
          exercises: [
            {
              id: v4(),
              exerciseId: action.exercise.id,
              name: action.exercise.name,
              note: "",
            },
          ],
        },
      ],
    };
  }
}

function move(traineeId: string, action: MoveExerciseAction): TransformResult {
  const sourceWorkout = action.sourceWorkout;
  const targetWorkout = action.targetWorkout;

  const existingExercise = sourceWorkout!.exercises.find(
    (x) => x.id === action.plannedExercise.id
  )!;

  const exercise = {
    ...existingExercise,
    id: v4(),
  };

  const updateWorkout = action.clone
    ? sourceWorkout
    : {
        ...sourceWorkout,
        exercises: sourceWorkout.exercises.filter(
          (x) => x.id !== existingExercise.id
        ),
      };

  if (targetWorkout) {
    return {
      create: [],
      update: [
        {
          ...targetWorkout,
          exercises: insertAt(targetWorkout.exercises, action.index, exercise),
        },
        updateWorkout,
      ],
    };
  } else {
    return {
      create: [
        {
          id: v4(),
          traineeId,
          name: "",
          note: null,
          plannedAt: action.targetDate.format(PLANNED_AT),
          exercises: [exercise],
        },
      ],
      update: [updateWorkout],
    };
  }
}

export function transform(traineeId: string, action: Action) {
  if (action?.type == "addExercise") {
    return add(traineeId, action);
  }

  if (action?.type == "moveExercise") {
    return move(traineeId, action);
  }

  return {
    create: [],
    update: [],
  };
}
