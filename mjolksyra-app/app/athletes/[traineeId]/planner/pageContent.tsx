"use client";

import { WorkoutPlanner } from "@/components/WorkoutPlanner/WorkoutPlanner";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { parse } from "./parse";
import { useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { transform } from "./transformers";
import { createPlannedWorkout } from "@/api/plannedWorkouts/createPlannedWorkout";
import { updatePlannedWorkout } from "@/api/plannedWorkouts/updatePlannedWorkout";

const queryClient = new QueryClient();

type Props = {
  traineeId: string;
};

export function PageContent({ traineeId }: Props) {
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const action = parse(event);
      const result = transform(traineeId, action);

      console.log(action);

      const createTasks = result.create.map((plannedWorkout) =>
        createPlannedWorkout({ plannedWorkout })
      );

      const updateTasks = result.update.map((plannedWorkout) =>
        updatePlannedWorkout({ plannedWorkout })
      );

      const updated = await Promise.all([...createTasks, ...updateTasks]);

      for (const workout of updated) {
        const [year, month] = workout.plannedAt.split("-");

        await queryClient.refetchQueries({
          queryKey: ["workouts", Number(year), Number(month) - 1],
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
            <WorkoutPlanner traineeId={traineeId} />
          </DndContext>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}
