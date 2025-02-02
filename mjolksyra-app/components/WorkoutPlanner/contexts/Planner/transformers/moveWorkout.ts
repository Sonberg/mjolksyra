import { v4 } from "uuid";
import { MoveWorkoutAction } from "../parse";
import { TransformResult } from "./";
import { PLANNED_AT } from "@/constants/dateFormats";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";

export function moveWorkout(traineeId: string, action: MoveWorkoutAction) {
  const updateSourceWorkout = action.clone
    ? []
    : ([
        {
          id: action.sourceWorkout!.id,
          plannedAt: action.sourceWorkout!.plannedAt,
          traineeId: traineeId,
          exercises: [],
          name: null,
          note: null,
          createdAt: null,
        },
      ] as PlannedWorkout[]);

  const workoutExists = (): TransformResult => {
    return {
      delete: [],
      create: [],
      update: [
        ...updateSourceWorkout,
        {
          ...action.targetWorkout!,
          exercises: action.sourceWorkout!.exercises.map((x) => ({
            ...x,
            id: v4(),
          })),
        },
      ],
    };
  };

  const workoutMissing = (): TransformResult => {
    return {
      delete: [],
      update: [...updateSourceWorkout],
      create: [
        {
          id: v4(),
          traineeId,
          name: null,
          note: null,
          createdAt: null,
          plannedAt: action.targetDate.format(PLANNED_AT),
          exercises: action.sourceWorkout!.exercises.map((x) => ({
            ...x,
            id: v4(),
          })),
        },
      ],
    };
  };

  return action.targetWorkout ? workoutExists() : workoutMissing();
}
