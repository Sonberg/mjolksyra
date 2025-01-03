import { DragEndEvent } from "@dnd-kit/core";

type Data = {
  index?: number;
  workoutId?: string;
  workoutDate?: string;
  exerciseId?: string;
  plannedExerciseId?: string;
  name: string;
  source: "workout" | "library";
  type: "workout" | "exercise" | "plannedExercise";
  clone?: boolean;
};

type AddExerciseAction = {
  type: "addExercise";
  exerciseId: string;
  name: string;
  date: string;
  index?: number;
};

type MoveExerciseAction = {
  type: "moveExercise";
  plannedExerciseId: string;
  sourceWorkoutId: string;
  targetDate: string;
  index?: number;
  clone?: boolean;
};

type Action = AddExerciseAction | MoveExerciseAction | null;

export function parse({ active, over }: DragEndEvent): Action {
  const activeData = over?.data.current as Data | undefined;
  const overData = active.data.current as Data | undefined;

  console.log({ activeData, overData });

  if (!activeData) {
    return null;
  }

  if (!overData) {
    return null;
  }

  if (overData.source === "library") {
    return {
      type: "addExercise",
      exerciseId: overData.exerciseId!,
      name: overData.name,
      date: activeData.workoutDate!,
      index: activeData.index,
    };
  }

  if (activeData.type === "workout" && overData.workoutId) {
    return {
      type: "moveExercise",
      targetDate: activeData.workoutDate ?? `${over?.id!}`,
      plannedExerciseId: overData.plannedExerciseId!,
      sourceWorkoutId: overData.workoutId!,
      clone: overData.clone,
    };
  }

  if (activeData.type === "plannedExercise" && overData.workoutId) {
    return {
      type: "moveExercise",
      targetDate: activeData.workoutDate ?? `${over?.id!}`,
      plannedExerciseId: overData.plannedExerciseId!,
      sourceWorkoutId: overData.workoutId!,
      index: activeData.index,
      clone: overData.clone,
    };
  }

  return null;
}
