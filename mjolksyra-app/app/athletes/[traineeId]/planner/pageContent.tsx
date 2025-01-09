"use client";

import { WorkoutPlanner } from "@/components/WorkoutPlanner/WorkoutPlanner";
import { usePlannerStore } from "@/stores/plannerStore";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { parse } from "./parse";
import { useCallback, useMemo } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { execute } from "./execute";

const queryClient = new QueryClient();

type Props = {
  traineeId: string;
};

export function PageContent({ traineeId }: Props) {
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

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const action = parse(event);

      await execute(traineeId, action);

      if (action) {
        await queryClient.refetchQueries({
          queryKey: [
            "workouts",
            action.targetDate.year(),
            action.targetDate.month(),
          ],
        });
      }
    },
    [traineeId]
  );

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <DndContext onDragEnd={handleDragEnd}>
            <SortableContext items={exerciseIds}>
              <WorkoutPlanner traineeId={traineeId} />
            </SortableContext>
          </DndContext>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}
