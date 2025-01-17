import { v4 } from "uuid";
import { MoveWeekAction } from "../parse";
import { TransformResult } from ".";
import { PlannedWorkout } from "@/api/plannedWorkouts/type";
import { getDatesBetween } from "@/lib/getDatesBetween";
import { PLANNED_AT } from "@/constants/dateFormats";

export function moveWeek(action: MoveWeekAction): TransformResult {
  const workouts = Object.values(action.workouts).flatMap((x) => x);
  const sourceDays = getDatesBetween(
    action.sourceDays[0].startOf("week"),
    action.sourceDays[0].endOf("week")
  );

  const targetDays = getDatesBetween(
    action.targetDays[0].startOf("week"),
    action.targetDays[0].endOf("week")
  );

  const targetdWorkouts = sourceDays
    .map((date) => {
      const plannedAt = date.format(PLANNED_AT);
      const sourceWorkout = workouts.find((y) => y.plannedAt == plannedAt);

      const newPlannedAt = targetDays
        .find((x) => x.format("ddd") === date.format("ddd"))!
        .format(PLANNED_AT);

      const targetWorkout = workouts.find((y) => y.plannedAt == newPlannedAt);

      if (!sourceWorkout && targetWorkout) {
        return {
          ...targetWorkout,
          exercises: [],
        };
      }

      if (!sourceWorkout) {
        return null;
      }

      return {
        id: targetWorkout?.id ?? v4(),
        traineeId: sourceWorkout.traineeId,
        plannedAt: newPlannedAt,
        exercises: sourceWorkout.exercises.map((y) => ({
          ...y,
          id: v4(),
        })),
        createdAt: targetWorkout?.createdAt,
      };
    })
    .filter((x): x is PlannedWorkout => !!x);

  const sourceToDelete = action.clone
    ? []
    : sourceDays
        .map((date) => {
          const plannedAt = date.format(PLANNED_AT);
          const workout = workouts.find((y) => y.plannedAt == plannedAt);

          return workout;
        })
        .filter((x): x is PlannedWorkout => !!x);

  return {
    create: targetdWorkouts.filter((x) => !x.createdAt),
    update: targetdWorkouts.filter((x) => x.createdAt),
    delete: [...sourceToDelete],
  };
}
