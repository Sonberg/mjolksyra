"use client";

import { createPlannedWorkout } from "@/services/plannedWorkouts/createPlannedWorkout";
import { deletePlannedWorkout } from "@/services/plannedWorkouts/deletePlannedWorkout";
import { getPlannedWorkouts } from "@/services/plannedWorkouts/getPlannedWorkout";
import { updatePlannedWorkout } from "@/services/plannedWorkouts/updatePlannedWorkout";
import { ExerciseLibrary } from "@/components/ExerciseLibrary";
import { WorkoutPlanner } from "@/components/WorkoutPlanner/WorkoutPlanner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { exercisesApi } from "@/services/client";

const queryClient = new QueryClient();

type Props = {
  traineeId: string;
};

export function PageContent({ traineeId }: Props) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WorkoutPlanner
            traineeId={traineeId}
            plannedWorkouts={{
              get: getPlannedWorkouts,
              create: createPlannedWorkout,
              update: updatePlannedWorkout,
              delete: deletePlannedWorkout,
            }}
            library={
              <ExerciseLibrary
                exercies={{
                  starred: exercisesApi.exercisesStarred,
                  star: exercisesApi.exercisesStar,
                  search: exercisesApi.exercisesSearch,
                  get: exercisesApi.exercisesGet,
                  delete: exercisesApi.exercisesDelete,
                  create: exercisesApi.exercisesCreate,
                }}
              />
            }
          />
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}
