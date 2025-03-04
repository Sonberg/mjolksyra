import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { Action } from "../parse";
import { addFromLibrary } from "./addFromLibrary";
import { moveExercise } from "./moveExercise";
import { moveWorkout } from "./moveWorkout";
import { moveWeek } from "./moveWeek";

export type TransformResult = {
  create: PlannedWorkout[];
  update: PlannedWorkout[];
  delete: PlannedWorkout[];
};

export function transform(traineeId: string, action: Action) {
  if (!action) {
    return {
      create: [],
      update: [],
      delete: [],
    };
  }

  switch (action.type) {
    case "addExercise":
      return addFromLibrary(traineeId, action);

    case "moveExercise":
      return moveExercise(traineeId, action);

    case "moveWorkout":
      return moveWorkout(traineeId, action);

    case "moveWeek":
      return moveWeek(action);

    case "upsertWorkouts":
      return {
        delete: [],
        create: action.upsert.filter((x) => !x.createdAt),
        update: action.upsert.filter((x) => x.createdAt),
      };

    default:
      return {
        create: [],
        update: [],
        delete: [],
      };
  }
}
