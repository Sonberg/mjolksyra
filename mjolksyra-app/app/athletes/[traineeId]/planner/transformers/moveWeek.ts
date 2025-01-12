import { v4 } from "uuid";
import { MoveWeekAction } from "../parse";
import { PLANNED_AT } from "@/constants/dateFormats";

export function moveWeek(traineeId: string, action: MoveWeekAction) {
  const targetYear = action.targetDays[0].year();
  const targetWeek = action.targetDays[0].week();
  const workoutsMovedToNewWeek = action.sourceDays
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
        id: v4(),
        plannedAt: sameDayDifferentWeek.format(PLANNED_AT),
        exercises: workout.exercises.map((y) => ({
          ...y,
          id: v4(),
        })),
      };
    })
    .filter((x) => x);

  console.log(workoutsMovedToNewWeek);

  return {
    create: [],
    update: [],
  };
}
