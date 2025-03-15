"use client";

import { createExercise } from "@/services/exercises/createExercise";
import { deleteExercise } from "@/services/exercises/deleteExercise";
import { getExercises } from "@/services/exercises/getExercises";
import { starExercises } from "@/services/exercises/starExercise";
import { starredExercises } from "@/services/exercises/starredExercises";
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
                  starred: starredExercises,
                  star: ({ signal, ...request }) => exercisesApi.exercisesStar(request, { signal }),
                  search: ({ freeText, signal }) =>
                    exercisesApi.exercisesSearch(
                      {
                        searchExercisesRequest: { freeText },
                      },
                      { signal }
                    ),
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
