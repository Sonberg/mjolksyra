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

export type Payload =
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
  const overData = over?.data.current as Payload | undefined;
  const activeData = active.data.current as Payload | undefined;
  const target = activatorEvent.target as HTMLElement;
  const clone = target?.getAttribute("data-action") === "clone";

  if (!overData) {
    return null;
  }

  if (!activeData) {
    return null;
  }

  // Add from library
  if (activeData.type === "exercise") {
    if (
      overData.type !== "plannedExercise" &&
      overData.type !== "plannedWorkout"
    ) {
      return null;
    }

    return {
      type: "addExercise",
      exercise: activeData.exercise!,
      targetDate: overData.date!,
      targetWorkout: overData.plannedWorkout!,
      index: overData.type === "plannedExercise" ? overData.index : undefined,
    };
  }

  // Exercise -> Workout
  if (
    overData.type === "plannedWorkout" &&
    activeData.type === "plannedExercise"
  ) {
    return {
      type: "moveExercise",
      plannedExercise: activeData.plannedExercise!,
      sourceWorkout: activeData.plannedWorkout!,
      targetWorkout: overData.plannedWorkout,
      targetDate: overData.date,
      clone: clone,
    };
  }

  // Exercise -> Exercise
  if (
    overData.type === "plannedExercise" &&
    activeData.type == "plannedExercise"
  ) {
    return {
      type: "moveExercise",
      targetDate: overData.date,
      plannedExercise: activeData.plannedExercise!,
      sourceWorkout: activeData.plannedWorkout!,
      targetWorkout: overData.plannedWorkout!,
      index: overData.index,
      clone: clone,
    };
  }

  // Workout -> Workout or Exercise
  if (
    (overData.type === "plannedWorkout" ||
      overData.type === "plannedExercise") &&
    activeData.type === "plannedWorkout"
  ) {
    return {
      type: "moveWorkout",
      sourceWorkout: activeData.plannedWorkout,
      targetWorkout: overData.plannedWorkout,
      targetDate: overData.date,
      clone: clone,
    };
  }

  // Workout -> Workout
  if (
    overData.type === "plannedWorkout" &&
    activeData.type === "plannedWorkout"
  ) {
    return {
      type: "moveWorkout",
      sourceWorkout: activeData.plannedWorkout,
      targetWorkout: overData.plannedWorkout,
      targetDate: overData.date,
      clone: clone,
    };
  }

  // Week -> Week
  if (overData.type === "week" && activeData.type === "week") {
    return {
      type: "moveWeek",
      sourceDays: activeData.days,
      sourceWorkouts: activeData.plannedWorkouts,
      targetWorkouts: overData.plannedWorkouts,
      targetDays: overData.days,
      targetWeekNumber: overData.weekNumber,
      clone: clone,
    };
  }

  return null;
}
