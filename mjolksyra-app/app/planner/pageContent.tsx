"use client";

import { WorkoutPlanner } from "@/components/WorkoutPlanner/WorkoutPlanner";
import { usePlannerStore } from "@/stores/plannerStore";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { parse } from "./parse";
import { useMemo } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function PageContent() {
  const store = usePlannerStore();
  const exerciseIds = useMemo(
    () =>
      store.workouts.reduce<string[]>(
        (accumulator, currentItem) => [
          ...accumulator,
          ...currentItem.exercises.map((x) => x.id),
        ],
        []
      ),
    []
  );

  function handleDragEnd(event: DragEndEvent) {
    const action = parse(event);

    console.log(action);

    if (!action) {
      return;
    }

    if (action.type === "addExercise") {
      store.addExercise(action);
      return;
    }

    if (action.type === "moveExercise") {
      store.moveExercise(action);
      return;
    }
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <DndContext onDragEnd={handleDragEnd}>
            <SortableContext items={exerciseIds}>
              <WorkoutPlanner />
            </SortableContext>
          </DndContext>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}
