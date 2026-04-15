import { v4 } from "uuid";
import { MoveWeekAction } from "../parse";
import { TransformResult } from ".";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
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
          publishedExercises: [],
          draftExercises: [],
        } as PlannedWorkout;
      }

      if (!sourceWorkout) {
        return null;
      }

      const sourceDraft = sourceWorkout.draftExercises ?? sourceWorkout.publishedExercises;

      return {
        id: targetWorkout?.id ?? v4(),
        traineeId: sourceWorkout.traineeId,
        plannedAt: newPlannedAt,
        name: sourceWorkout.name,
        note: sourceWorkout.note,
        appliedBlock: sourceWorkout.appliedBlock ?? null,
        publishedExercises: [],
        draftExercises: sourceDraft.map((y) => ({
          ...y,
          id: v4(),
        })),
        createdAt: targetWorkout?.createdAt ?? null,
      } as PlannedWorkout;
    })
    .filter((x): x is PlannedWorkout => x !== null);

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
