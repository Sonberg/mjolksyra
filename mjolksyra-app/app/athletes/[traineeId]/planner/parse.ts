import { Exercise } from "@/api/exercises/type";
import { PlannedExercise, PlannedWorkout } from "@/api/plannedWorkouts/type";
import { DragEndEvent } from "@dnd-kit/core";
import dayjs from "dayjs";

type Data = {
  index?: number;
  date: dayjs.Dayjs;
  plannedWorkout: PlannedWorkout;
  plannedExercise: PlannedExercise;
  exercise: Exercise;
  source: "workout" | "library";
  type: "workout" | "exercise" | "plannedExercise";
};

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

export type Action = AddExerciseAction | MoveExerciseAction | null;

export function parse({ activatorEvent, active, over }: DragEndEvent): Action {
  const activeData = over?.data.current as Data | undefined;
  const overData = active.data.current as Data | undefined;
  const target = activatorEvent.target as HTMLElement;
  const clone = target?.getAttribute("data-action") === "clone";

  if (!activeData) {
    return null;
  }

  if (!overData) {
    return null;
  }

  if (overData.source === "library") {
    return {
      type: "addExercise",
      exercise: overData.exercise!,
      targetDate: activeData.date!,
      targetWorkout: activeData.plannedWorkout!,
      index: activeData.index,
    };
  }

  if (activeData.type === "workout" && overData.plannedWorkout?.id) {
    return {
      type: "moveExercise",
      plannedExercise: overData.plannedExercise!,
      sourceWorkout: overData.plannedWorkout!,
      targetWorkout: activeData.plannedWorkout,
      targetDate: activeData.date ?? `${over?.id!}`,
      clone: clone,
    };
  }

  if (activeData.type === "plannedExercise" && overData.plannedWorkout?.id) {
    return {
      type: "moveExercise",
      targetDate: activeData.date ?? `${over?.id!}`,
      plannedExercise: overData.plannedExercise!,
      sourceWorkout: overData.plannedWorkout!,
      targetWorkout: activeData.plannedWorkout!,
      index: activeData.index,
      clone: clone,
    };
  }

  return null;
}
