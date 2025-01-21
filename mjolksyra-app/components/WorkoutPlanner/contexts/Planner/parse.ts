import { Exercise } from "@/api/exercises/type";
import { PlannedExercise, PlannedWorkout } from "@/api/plannedWorkouts/type";
import { DragEndEvent } from "@dnd-kit/core";
import dayjs from "dayjs";
import { isDraggingWeek, isDraggingWorkout } from "./utils";
import { MonthWorkouts } from "../Workouts/workoutsReducer";
import { workoutChanged } from "@/lib/workoutChanged";

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
  upsert: PlannedWorkout[];
};

export type State = {
  old: MonthWorkouts;
  new: MonthWorkouts;
};

export type Action =
  | AddExerciseAction
  | MoveExerciseAction
  | MoveWorkoutAction
  | MoveWeekAction
  | UpsertAction
  | null;

export function parse(event: DragEndEvent, state: State): Action {
  const { activatorEvent, active, over } = event;
  const overData = over?.data.current as Payload | undefined;
  const activeData = active.data.current as Payload | undefined;
  const target = activatorEvent.target as HTMLElement;
  const clone = target?.getAttribute("data-action") === "clone";

  console.log(event);

  if (!overData) {
    return null;
  }

  if (!activeData) {
    return null;
  }

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
    const oldState = Object.values(state.old).flatMap((x) => x);
    const newState = Object.values(state.new).flatMap((x) => x);
    const changed = newState.filter((x) => workoutChanged(x, oldState));

    console.log("changed", changed);

    return {
      type: "upsertWorkouts",
      upsert: changed,
    };
  }

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
      workouts: state.new,
      clone: clone,
    };
  }

  return null;
}
