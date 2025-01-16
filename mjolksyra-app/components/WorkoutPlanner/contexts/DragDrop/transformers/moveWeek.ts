import { v4 } from "uuid";
import { MoveWeekAction } from "../parse";
import { PLANNED_AT } from "@/constants/dateFormats";
import { TransformResult } from ".";

export function moveWeek(action: MoveWeekAction): TransformResult {
  const targetYear = action.targetDays[0].year();
  const targetWeek = action.targetDays[0].week();

  const workoutsToDelete = action.targetDays
    .map((date) => {
      const plannedAt = date.format(PLANNED_AT);
      const workout = action.sourceWorkouts.find(
        (y) => y.plannedAt == plannedAt
      );

      return workout;
    })
    .filter((x) => x !== undefined);

  const workoutsToUpdate = action.sourceDays
    .map((date) => {
      const plannedAt = date.format(PLANNED_AT);
      const workout = action.sourceWorkouts.find(
        (y) => y.plannedAt == plannedAt
      );

      if (!workout) {
        return null;
      }

      const sameDayDifferentWeek = date.week(targetWeek).year(targetYear);

      return {
        ...workout,
        id: action.clone ? v4() : workout.id,
        plannedAt: sameDayDifferentWeek.format(PLANNED_AT),
        exercises: workout.exercises.map((y) => ({
          ...y,
          id: v4(),
        })),
      };
    })
    .filter((x) => x !== null);

  return {
    create: action.clone ? workoutsToUpdate : [],
    update: action.clone ? [] : workoutsToUpdate,
    delete: workoutsToDelete,
  };
}
