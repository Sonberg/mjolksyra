import { PlannedWorkout, PlannedExercise } from "@/api/plannedWorkouts/type";
import { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { createContext, useContext } from "react";
import { Payload } from "./parse";

type Clone = {
  targetMonth: string;
  targetDate: string;
  targetWorkout?: PlannedWorkout;
  exercise: PlannedExercise;
  index: number;
};

export const CloningContext = createContext<Clone | null>(null);

export const useCloning = () => useContext(CloningContext);

const attributeName = "data-action";
const getTarget = (el: HTMLElement): HTMLElement | null => {
  return el.hasAttribute(attributeName)
    ? el
    : el.parentElement
    ? getTarget(el.parentElement)
    : null;
};

export function isCloning(event: DragEndEvent | DragOverEvent) {
  const activeData = event.active?.data.current as Payload | undefined;
  const eventTarget = getTarget(event.activatorEvent.target as HTMLElement);

  return (
    eventTarget?.getAttribute(attributeName) === "clone" ||
    activeData?.type === "exercise"
  );
}
