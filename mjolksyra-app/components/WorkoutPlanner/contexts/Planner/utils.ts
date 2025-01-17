import { v4 } from "uuid";
import { Payload } from "./parse";
import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { PlannedExercise } from "@/api/plannedWorkouts/type";

type Event = DragStartEvent | DragOverEvent | DragEndEvent;

export function isDraggingWorkout(event: Event) {
  return (
    (event.active.data.current as Payload | undefined)?.type ===
    "plannedWorkout"
  );
}

export function isDraggingWeek(event: Event) {
  return (event.active.data.current as Payload | undefined)?.type === "week";
}

export function getExercise(event: Event, clone: boolean) {
  const activeData = event.active?.data.current as Payload | undefined;

  if (activeData?.type == "plannedExercise") {
    return activeData.plannedExercise
      ? {
          ...activeData.plannedExercise,
          id: clone ? v4() : activeData.plannedExercise.id,
        }
      : null;
  }

  if (activeData?.type == "exercise") {
    return {
      id: v4(),
      name: activeData.exercise.name,
      exerciseId: activeData.exercise.id,
    } as PlannedExercise;
  }

  return null;
}
