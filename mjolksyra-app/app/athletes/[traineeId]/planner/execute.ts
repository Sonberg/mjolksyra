import { Action } from "./parse";
import { transform } from "./transformers";
import { createPlannedWorkout } from "@/api/plannedWorkouts/createPlannedWorkout";
import { updatePlannedWorkout } from "@/api/plannedWorkouts/updatePlannedWorkout";

export async function execute(traineeId: string, action: Action) {
  if (!action) {
    return null;
  }

  const result = transform(traineeId, action);

  const createTasks = result.create.map((plannedWorkout) =>
    createPlannedWorkout({ plannedWorkout })
  );

  const updateTasks = result.update.map((plannedWorkout) =>
    updatePlannedWorkout({ plannedWorkout })
  );

  await Promise.all([...createTasks, ...updateTasks]);
}
