"use client";

import { createExercise } from "@/api/exercises/createExercise";
import { deleteExercise } from "@/api/exercises/deleteExercise";
import { getExercises } from "@/api/exercises/getExercises";
import { searchExercises } from "@/api/exercises/searchExercises";
import { starExercises } from "@/api/exercises/starExercise";
import { starredExercises } from "@/api/exercises/starredExercises";
import { createPlannedWorkout } from "@/api/plannedWorkouts/createPlannedWorkout";
import { deletePlannedWorkout } from "@/api/plannedWorkouts/deletePlannedWorkout";
import { getPlannedWorkouts } from "@/api/plannedWorkouts/getPlannedWorkout";
import { updatePlannedWorkout } from "@/api/plannedWorkouts/updatePlannedWorkout";
import { ExerciseLibrary } from "@/components/ExerciseLibrary";
import { WorkoutPlanner } from "@/components/WorkoutPlanner/WorkoutPlanner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
                  starred: starredExercises,
                  star: starExercises,
                  search: searchExercises,
                  get: getExercises,
                  delete: deleteExercise,
                  create: createExercise,
                }}
              />
            }
          />
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}
