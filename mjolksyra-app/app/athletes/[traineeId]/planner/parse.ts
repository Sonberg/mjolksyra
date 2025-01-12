import { Exercise } from "@/api/exercises/type";
import { PlannedExercise, PlannedWorkout } from "@/api/plannedWorkouts/type";
import { DragEndEvent } from "@dnd-kit/core";
import dayjs from "dayjs";

type PlannedWorkoutPayload = {
  date: dayjs.Dayjs;
  plannedWorkout?: PlannedWorkout;
  exercise: Exercise;
  type: "plannedWorkout";
};

type PlannedExercisePayload = {
  index: number;
  date: dayjs.Dayjs;
  plannedWorkout: PlannedWorkout;
  plannedExercise?: PlannedExercise;
  type: "plannedExercise";
};

type ExercisePayload = {
  exercise: Exercise;
  type: "exercise";
};

type WeekPayload = {
  type: "week";
  weekNumber: number;
  days: dayjs.Dayjs[];
  plannedWorkouts: PlannedWorkout[];
};

type Data =
  | PlannedExercisePayload
  | ExercisePayload
  | PlannedWorkoutPayload
  | WeekPayload;

export type AddExerciseAction = {
  type: "addExercise";
  exercise: Exercise;
  targetWorkout?: PlannedWorkout;
  targetDate: dayjs.Dayjs;
  index?: number;
};

export type MoveExerciseAction = {
  type: "moveExercise";
  plannedExercise: PlannedExercise;
  sourceWorkout: PlannedWorkout;
  targetWorkout?: PlannedWorkout;
  targetDate: dayjs.Dayjs;
  index?: number;
  clone?: boolean;
};

export type MoveWorkoutAction = {
  type: "moveWorkout";
  sourceWorkout: PlannedWorkout | undefined;
  targetWorkout?: PlannedWorkout | undefined;
  targetDate: dayjs.Dayjs;
  clone?: boolean;
};

export type MoveWeekAction = {
  type: "moveWeek";
  sourceDays: dayjs.Dayjs[];
  sourceWorkouts: PlannedWorkout[];
  targetWorkouts: PlannedWorkout[];
  targetDays: dayjs.Dayjs[];
  targetWeekNumber: number;
  clone?: boolean;
};

export type Action =
  | AddExerciseAction
  | MoveExerciseAction
  | MoveWorkoutAction
  | MoveWeekAction
  | null;

export function parse({ activatorEvent, active, over }: DragEndEvent): Action {
  const activeData = over?.data.current as Data | undefined;
  const overData = active.data.current as Data | undefined;
  const target = activatorEvent.target as HTMLElement;
  const clone = target?.getAttribute("data-action") === "clone";

  console.log({ activeData: activeData?.type, overData: overData?.type });

  if (!activeData) {
    return null;
  }

  if (!overData) {
    return null;
  }

  // Add from library
  if (overData.type === "exercise") {
    if (
      activeData.type !== "plannedExercise" &&
      activeData.type !== "plannedWorkout"
    ) {
      return null;
    }

    return {
      type: "addExercise",
      exercise: overData.exercise!,
      targetDate: activeData.date!,
      targetWorkout: activeData.plannedWorkout!,
      index:
        activeData.type === "plannedExercise" ? activeData.index : undefined,
    };
  }

  // Exercise -> Workout
  if (
    activeData.type === "plannedWorkout" &&
    overData.type === "plannedExercise"
  ) {
    return {
      type: "moveExercise",
      plannedExercise: overData.plannedExercise!,
      sourceWorkout: overData.plannedWorkout!,
      targetWorkout: activeData.plannedWorkout,
      targetDate: activeData.date,
      clone: clone,
    };
  }

  // Exercise -> Exercise
  if (
    activeData.type === "plannedExercise" &&
    overData.type == "plannedExercise"
  ) {
    return {
      type: "moveExercise",
      targetDate: activeData.date,
      plannedExercise: overData.plannedExercise!,
      sourceWorkout: overData.plannedWorkout!,
      targetWorkout: activeData.plannedWorkout!,
      index: activeData.index,
      clone: clone,
    };
  }

  // Workout -> Workout or Exercise
  if (
    (activeData.type === "plannedWorkout" ||
      activeData.type === "plannedExercise") &&
    overData.type === "plannedWorkout"
  ) {
    return {
      type: "moveWorkout",
      sourceWorkout: overData.plannedWorkout,
      targetWorkout: activeData.plannedWorkout,
      targetDate: activeData.date,
      clone: clone,
    };
  }

  // Workout -> Workout
  if (
    activeData.type === "plannedWorkout" &&
    overData.type === "plannedWorkout"
  ) {
    return {
      type: "moveWorkout",
      sourceWorkout: overData.plannedWorkout,
      targetWorkout: activeData.plannedWorkout,
      targetDate: activeData.date,
      clone: clone,
    };
  }

  // Week -> Week
  if (activeData.type === "week" && overData.type === "week") {
    return {
      type: "moveWeek",
      sourceDays: overData.days,
      sourceWorkouts: overData.plannedWorkouts,
      targetWorkouts: activeData.plannedWorkouts,
      targetDays: activeData.days,
      targetWeekNumber: activeData.weekNumber,
      clone: clone,
    };
  }

  return null;
}
