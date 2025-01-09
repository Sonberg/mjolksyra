"use client";

import { WorkoutPlanner } from "@/components/WorkoutPlanner/WorkoutPlanner";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { parse } from "./parse";
import { useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { execute } from "./execute";
import { PlannerProvider } from "@/context/Planner/Planner";

const queryClient = new QueryClient();

type Props = {
  traineeId: string;
};

export function PageContent({ traineeId }: Props) {
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const action = parse(event);

      await execute(traineeId, action);

      if (action) {
        await queryClient.refetchQueries({
          queryKey: ["workouts"],
        });
      }
    },
    [traineeId]
  );

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <PlannerProvider traineeId={traineeId}>
          <TooltipProvider>
            <DndContext onDragEnd={handleDragEnd}>
              <WorkoutPlanner traineeId={traineeId} />
            </DndContext>
          </TooltipProvider>
        </PlannerProvider>
      </QueryClientProvider>
    </>
  );
}
