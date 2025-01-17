import { Exercise } from "@/api/exercises/type";
import { PlannedExercise, PlannedWorkout } from "@/api/plannedWorkouts/type";
import { DragEndEvent } from "@dnd-kit/core";
import dayjs from "dayjs";
import { isDraggingWeek, isDraggingWorkout } from "./utils";
import { MonthWorkouts } from "../Workouts/workoutsReducer";

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
  targetDays: dayjs.Dayjs[];
  workouts: MonthWorkouts;
  clone?: boolean;
};

export type UpsertAction = {
  type: "upsertWorkouts";
  workouts: PlannedWorkout[];
};

export type Action =
  | AddExerciseAction
  | MoveExerciseAction
  | MoveWorkoutAction
  | MoveWeekAction
  | UpsertAction
  | null;

export function parse(event: DragEndEvent, workouts: MonthWorkouts): Action {
  const { activatorEvent, active, over } = event;
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
  // if (activeData.type === "exercise") {
  //   if (
  //     overData.type !== "plannedExercise" &&
  //     overData.type !== "plannedWorkout"
  //   ) {
  //     return null;
  //   }

  //   return {
  //     type: "addExercise",
  //     exercise: activeData.exercise!,
  //     targetDate: overData.date!,
  //     targetWorkout: overData.plannedWorkout!,
  //     index: overData.type === "plannedExercise" ? overData.index : undefined,
  //   };
  // }

  const targetWorkout =
    overData.type === "plannedWorkout" || overData.type === "plannedExercise"
      ? overData
      : null;

  const sourceWorkout =
    activeData.type === "plannedWorkout" ||
    activeData.type === "plannedExercise"
      ? activeData
      : null;

  const weekOrWorkout = isDraggingWeek(event) || isDraggingWorkout(event);

  if (!weekOrWorkout) {
    return {
      type: "upsertWorkouts",
      workouts: [
        targetWorkout?.plannedWorkout,
        sourceWorkout?.plannedWorkout,
      ].filter((x): x is PlannedWorkout => !!x),
    };
  }

  // // Exercise -> Workout
  // if (
  //   overData.type === "plannedWorkout" &&
  //   activeData.type === "plannedExercise"
  // ) {
  //   return {
  //     type: "moveExercise",
  //     plannedExercise: activeData.plannedExercise!,
  //     sourceWorkout: activeData.plannedWorkout!,
  //     targetWorkout: overData.plannedWorkout,
  //     targetDate: overData.date,
  //     clone: clone,
  //   };
  // }

  // // Exercise -> Exercise
  // if (
  //   overData.type === "plannedExercise" &&
  //   activeData.type == "plannedExercise"
  // ) {
  //   return {
  //     type: "moveExercise",
  //     targetDate: overData.date,
  //     plannedExercise: activeData.plannedExercise!,
  //     sourceWorkout: activeData.plannedWorkout!,
  //     targetWorkout: overData.plannedWorkout!,
  //     index: overData.index,
  //     clone: clone,
  //   };
  // }

  // // Workout -> Workout or Exercise
  // if (
  //   (overData.type === "plannedWorkout" ||
  //     overData.type === "plannedExercise") &&
  //   activeData.type === "plannedWorkout"
  // ) {
  //   return {
  //     type: "moveWorkout",
  //     sourceWorkout: activeData.plannedWorkout,
  //     targetWorkout: overData.plannedWorkout,
  //     targetDate: overData.date,
  //     clone: clone,
  //   };
  // }

  // Workout -> Workout
  if (sourceWorkout?.type === "plannedWorkout" && targetWorkout) {
    return {
      type: "moveWorkout",
      sourceWorkout: sourceWorkout.plannedWorkout,
      targetWorkout: targetWorkout.plannedWorkout,
      targetDate: targetWorkout.date,
      clone: clone,
    };
  }

  // Week -> Week
  if (overData.type === "week" && activeData.type === "week") {
    return {
      type: "moveWeek",
      sourceDays: activeData.days,
      targetDays: overData.days,
      workouts: workouts,
      clone: clone,
    };
  }

  return null;
}
