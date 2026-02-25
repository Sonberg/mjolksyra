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
import { CoachWorkspaceShell } from "../../../CoachWorkspaceShell";

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
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-zinc-800 bg-zinc-950/90 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
              onClick={() => router.push("/app/coach/athletes")}
              aria-label="Back to athletes"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Planner
              </p>
              <div className="text-lg font-semibold text-zinc-100">
                {athleteName}
              </div>
            </div>
          </div>
        </div>
        <Tabs
          defaultValue="exercises"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="border-b border-zinc-800 bg-zinc-950/70 px-4 py-2">
            <TabsList className="m-0 inline-flex h-auto items-center justify-start gap-1 rounded-lg border border-zinc-800 bg-zinc-900/80 p-1">
              <TabsTrigger
                value="exercises"
                className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300 data-[state=active]:bg-zinc-100 data-[state=active]:text-black"
              >
                Exercises
              </TabsTrigger>
              <TabsTrigger
                value="blocks"
                className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300 data-[state=active]:bg-zinc-100 data-[state=active]:text-black"
              >
                Blocks
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="exercises"
            className="mt-0 min-h-0 flex-1 overflow-hidden"
          >
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
          <TabsContent
            value="blocks"
            className="mt-0 min-h-0 flex-1 overflow-y-auto"
          >
            <BlocksPanel getBlocks={getBlocks} />
          </TabsContent>
        </Tabs>
      </div>
    ),
    [router, athleteName],
  );

  return (
    <CoachWorkspaceShell fullBleed>
      <div className="h-[calc(100vh-7.5rem)] min-h-[680px] min-w-0 w-full overflow-hidden">
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
      </div>
    </CoachWorkspaceShell>
  );
}
