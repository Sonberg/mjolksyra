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
import { applyBlock } from "@/services/blocks/applyBlock";
import { getBlocks } from "@/services/blocks/getBlocks";
import { ExerciseLibrary } from "@/components/ExerciseLibrary";
import { BlocksPanel } from "@/components/BlocksPanel/BlocksPanel";
import { WorkoutPlanner } from "@/components/WorkoutPlanner/WorkoutPlanner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getTrainee } from "@/services/trainees/getTrainee";

type Props = {
  traineeId: string;
};

export function PageContent({ traineeId }: Props) {
  const router = useRouter();
  const { data: trainee } = useQuery({
    queryKey: ["trainees", traineeId, "plannerHeader"],
    queryFn: ({ signal }) => getTrainee({ id: traineeId, signal }),
  });
  const athleteName =
    trainee?.athlete?.givenName || trainee?.athlete?.familyName
      ? `${trainee?.athlete?.givenName ?? ""} ${trainee?.athlete?.familyName ?? ""}`.trim()
      : trainee?.athlete?.name || "Athlete";

  const rightSide = useMemo(
    () => (
      <>
        <div className="px-4 pt-2 flex gap-2 items-center">
          <div
            className="rounded-full p-2 hover:bg-zinc-800 cursor-pointer"
            onClick={() => router.push("/app/coach")}
          >
            <ChevronLeftIcon />
          </div>
          <div className="font-semibold text-lg text-zinc-100">{athleteName}</div>
        </div>
        <Tabs defaultValue="exercises" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mx-4 mb-0">
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="blocks">Blocks</TabsTrigger>
          </TabsList>
          <TabsContent value="exercises" className="flex-1 overflow-hidden mt-0">
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
          </TabsContent>
          <TabsContent value="blocks" className="flex-1 overflow-y-auto mt-0">
            <BlocksPanel getBlocks={getBlocks} />
          </TabsContent>
        </Tabs>
      </>
    ),
    [router, athleteName]
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
          blocks={{ apply: applyBlock }}
          rightSide={rightSide}
        />
      </TooltipProvider>
    </>
  );
}
