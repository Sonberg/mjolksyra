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
import { ChevronLeftIcon, RotateCcwIcon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { getTrainee } from "@/services/trainees/getTrainee";
import { CoachWorkspaceShell } from "../../../CoachWorkspaceShell";
import { useWorkouts } from "@/components/WorkoutPlanner/contexts/Workouts";
import { usePlannedWorkoutActions } from "@/components/WorkoutPlanner/contexts/PlannedWorkoutActions";
import { monthId } from "@/lib/monthId";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";

type Props = {
  traineeId: string;
};

function PlannerChangesTabLabel() {
  const { data } = useWorkouts();

  const pendingWorkoutCount = useMemo(
    () =>
      Object.values(data)
        .flatMap((month) => month)
        .filter((workout) => workout.exercises.some((exercise) => !exercise.isPublished))
        .length,
    [data]
  );

  return (
    <span className="inline-flex items-center gap-1.5">
      Changes
      {pendingWorkoutCount > 0 ? (
        <span className="rounded bg-sky-900/40 px-1.5 py-0.5 text-[10px] font-semibold text-sky-200">
          {pendingWorkoutCount}
        </span>
      ) : null}
    </span>
  );
}

function PlannerChangesPanel() {
  const { data, dispatch } = useWorkouts();
  const { update, delete: deleteWorkout } = usePlannedWorkoutActions();
  const [isSaving, setIsSaving] = useState(false);

  const draftWorkouts = useMemo(
    () =>
      Object.values(data)
        .flatMap((month) => month)
        .filter((workout) => workout.exercises.some((exercise) => !exercise.isPublished))
        .sort((a, b) => dayjs(a.plannedAt).valueOf() - dayjs(b.plannedAt).valueOf()),
    [data]
  );

  async function onPublishAll() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      for (const workout of draftWorkouts) {
        const publishedWorkout: PlannedWorkout = {
          ...workout,
          exercises: workout.exercises.map((exercise) => ({
            ...exercise,
            isPublished: true,
          })),
        };

        await update({ plannedWorkout: publishedWorkout });
        dispatch({
          type: "SET_WORKOUT",
          payload: {
            monthId: monthId(workout.plannedAt),
            plannedWorkout: publishedWorkout,
          },
        });
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function onRevertAll() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      for (const workout of draftWorkouts) {
        const publishedOnly = workout.exercises.filter((exercise) => exercise.isPublished);

        if (publishedOnly.length === 0) {
          await deleteWorkout({ plannedWorkout: workout });
          dispatch({
            type: "DELETE_WORKOUT",
            payload: {
              monthId: monthId(workout.plannedAt),
              plannedWorkoutId: workout.id,
            },
          });
          continue;
        }

        const revertedWorkout: PlannedWorkout = {
          ...workout,
          exercises: publishedOnly,
        };

        await update({ plannedWorkout: revertedWorkout });
        dispatch({
          type: "SET_WORKOUT",
          payload: {
            monthId: monthId(workout.plannedAt),
            plannedWorkout: revertedWorkout,
          },
        });
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-0 flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-zinc-800 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Pending changes
        </p>
        <p className="mt-1 text-sm text-zinc-300">
          {draftWorkouts.length === 0
            ? "No unpublished changes."
            : `${draftWorkouts.length} workout${draftWorkouts.length > 1 ? "s" : ""} have unpublished changes.`}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-sky-700/60 bg-sky-900/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-200 transition hover:bg-sky-900/35 disabled:cursor-not-allowed disabled:opacity-60"
            title="Publish all draft changes in loaded workouts"
            onClick={onPublishAll}
            disabled={isSaving || draftWorkouts.length === 0}
          >
            <UploadIcon className="h-3 w-3" />
            Publish all
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            title="Revert all drafts to the latest published state"
            onClick={onRevertAll}
            disabled={isSaving || draftWorkouts.length === 0}
          >
            <RotateCcwIcon className="h-3 w-3" />
            Revert all
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col gap-2">
          {draftWorkouts.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-sm text-zinc-400">
              Nothing to publish right now.
            </div>
          ) : (
            draftWorkouts.map((workout) => {
              const draftExercises = workout.exercises.filter((exercise) => !exercise.isPublished);
              return (
                <div
                  key={workout.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-100">
                      {dayjs(workout.plannedAt).format("ddd, D MMM YYYY")}
                    </p>
                    <span className="rounded border border-sky-800/70 bg-sky-950/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-200">
                      {draftExercises.length} draft
                    </span>
                  </div>
                  <p className="mt-2 truncate text-xs text-zinc-400">
                    {draftExercises.map((exercise) => exercise.name).join(", ")}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

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
          <div className="flex w-full items-center gap-2">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
              onClick={() => router.push("/app/coach/athletes")}
              aria-label="Back to athletes"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 flex-1 items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Planner
                </p>
                <div className="truncate text-lg font-semibold text-zinc-100">
                  {athleteName}
                </div>
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
              <TabsTrigger
                value="changes"
                className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300 data-[state=active]:bg-zinc-100 data-[state=active]:text-black"
              >
                <PlannerChangesTabLabel />
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
          <TabsContent
            value="changes"
            className="mt-0 min-h-0 flex-1 overflow-hidden"
          >
            <PlannerChangesPanel />
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
