"use client";

import { createExercise } from "@/services/exercises/createExercise";
import { deleteExercise } from "@/services/exercises/deleteExercise";
import { getExercises } from "@/services/exercises/getExercises";
import { searchExercises } from "@/services/exercises/searchExercises";
import { starExercises } from "@/services/exercises/starExercise";
import { starredExercises } from "@/services/exercises/starredExercises";
import { createPlannedWorkout } from "@/services/plannedWorkouts/createPlannedWorkout";
import { deletePlannedWorkout } from "@/services/plannedWorkouts/deletePlannedWorkout";
import { getPlannedWorkouts } from "@/services/plannedWorkouts/getPlannedWorkout";
import { updatePlannedWorkout } from "@/services/plannedWorkouts/updatePlannedWorkout";
import { ExerciseLibrary } from "@/components/ExerciseLibrary";
import { WorkoutPlanner } from "@/components/WorkoutPlanner/WorkoutPlanner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

type Props = {
  traineeId: string;
};

export function PageContent({ traineeId }: Props) {
  const router = useRouter();
  const rightSide = useMemo(
    () => (
      <>
        <div className="px-4 pt-2 flex gap-2 items-center">
          <div
            className="rounded-full p-2 hover:bg-blue-800 cursor-pointer"
            onClick={() => router.push("/app/coach")}
          >
            <ChevronLeftIcon />
          </div>
          <div className="font-bold text-lg">Per Sonberg</div>
        </div>
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
      </>
    ),
    [router]
  );

  return (
    <>
      <TooltipProvider>
        <WorkoutPlanner
          traineeId={traineeId}
          plannedWorkouts={{
            get: getPlannedWorkouts,
            create: createPlannedWorkout,
            update: updatePlannedWorkout,
            delete: deletePlannedWorkout,
          }}
          rightSide={rightSide}
        />
      </TooltipProvider>
    </>
  );
}
