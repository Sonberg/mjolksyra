"use client";

import { createExercise } from "@/services/exercises/createExercise";
import { deleteExercise } from "@/services/exercises/deleteExercise";
import { getExercises } from "@/services/exercises/getExercises";
import { searchExercises } from "@/services/exercises/searchExercises";
import { starExercises } from "@/services/exercises/starExercise";
import { starredExercises } from "@/services/exercises/starredExercises";
import { createPlannedWorkout } from "@/services/plannedWorkouts/createPlannedWorkout";
import { deletePlannedWorkout } from "@/services/plannedWorkouts/deletePlannedWorkout";
import {
  getDraftPlannedExercises,
  getPlannedWorkouts,
} from "@/services/plannedWorkouts/getPlannedWorkout";
import { updatePlannedWorkout } from "@/services/plannedWorkouts/updatePlannedWorkout";
import { applyBlock } from "@/services/blocks/applyBlock";
import { getBlocks } from "@/services/blocks/getBlocks";
import { ExerciseLibrary } from "@/components/ExerciseLibrary";
import { BlocksPanel } from "@/components/BlocksPanel/BlocksPanel";
import { WorkoutPlanner } from "@/components/WorkoutPlanner/WorkoutPlanner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SelectionTabs } from "@/components/Navigation/SelectionTabs";
import { AIPlannerPanel } from "@/components/AIPlannerPanel";
import { ChevronLeftIcon, RotateCcwIcon, SparklesIcon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useUserEvents } from "@/context/UserEvents/UserEvents";
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

function PlannerChangesTabLabel({
  pendingWorkoutCount,
}: {
  pendingWorkoutCount: number;
}) {
  return (
    <span className="inline-flex w-full items-center justify-center gap-1.5">
      Changes
      {pendingWorkoutCount > 0 ? (
        <span className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--shell-ink)]">
          {pendingWorkoutCount}
        </span>
      ) : null}
    </span>
  );
}

type PlannerChangesPanelProps = {
  draftWorkouts: PlannedWorkout[];
  onDraftsChanged: () => Promise<unknown>;
};

function PlannerChangesPanel({
  draftWorkouts,
  onDraftsChanged,
}: PlannerChangesPanelProps) {
  const { dispatch } = useWorkouts();
  const { update, delete: deleteWorkout } = usePlannedWorkoutActions();
  const [isSaving, setIsSaving] = useState(false);

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
      await onDraftsChanged();
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
        const publishedOnly = workout.exercises.filter(
          (exercise) => exercise.isPublished,
        );

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
      await onDraftsChanged();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-0 flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-[var(--shell-border)] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
          Pending changes
        </p>
        <p className="mt-1 text-sm text-[var(--shell-muted)]">
          {draftWorkouts.length === 0
            ? "No unpublished changes."
            : `${draftWorkouts.length} workout${draftWorkouts.length > 1 ? "s" : ""} have unpublished changes.`}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-none border border-transparent bg-[var(--shell-accent)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)] transition hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            title="Publish all draft changes"
            onClick={onPublishAll}
            disabled={isSaving || draftWorkouts.length === 0}
          >
            <UploadIcon className="h-3 w-3" />
            Publish all
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface)] disabled:cursor-not-allowed disabled:opacity-60"
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
            <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-3 text-sm text-[var(--shell-muted)]">
              Nothing to publish right now.
            </div>
          ) : (
            draftWorkouts.map((workout) => {
              const draftExercises = workout.exercises.filter(
                (exercise) => !exercise.isPublished,
              );
              return (
                <div
                  key={workout.id}
                  className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--shell-ink)]">
                      {dayjs(workout.plannedAt).format("ddd, D MMM YYYY")}
                    </p>
                    <span className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-ink)]">
                      {draftExercises.length} draft
                    </span>
                  </div>
                  <p className="mt-2 truncate text-xs text-[var(--shell-muted)]">
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
  const { subscribe } = useUserEvents();
  const [rightSideTab, setRightSideTab] = useState<
    "exercises" | "blocks" | "changes" | "ai"
  >("exercises");
  const { data: trainee } = useQuery({
    queryKey: ["trainees", traineeId, "plannerHeader"],
    queryFn: ({ signal }) => getTrainee({ id: traineeId, signal }),
  });
  const athleteName =
    trainee?.athlete?.givenName || trainee?.athlete?.familyName
      ? `${trainee?.athlete?.givenName ?? ""} ${trainee?.athlete?.familyName ?? ""}`.trim()
      : trainee?.athlete?.name || "Athlete";

  const { data: draftWorkouts = [], refetch: refetchDraftWorkouts } = useQuery({
    queryKey: ["planned-workouts", "drafts", traineeId],
    queryFn: async ({ signal }) => {
      const workouts: PlannedWorkout[] = [];
      let next: string | undefined;
      let pageCount = 0;

      while (pageCount < 50) {
        const response = await getDraftPlannedExercises({
          traineeId,
          limit: 200,
          next,
          sortBy: "plannedAt",
          order: "asc",
          signal,
        });

        workouts.push(...response.data);
        pageCount += 1;
        if (!response.next) {
          break;
        }

        next = response.next;
      }

      return workouts.sort(
        (a, b) => dayjs(a.plannedAt).valueOf() - dayjs(b.plannedAt).valueOf(),
      );
    },
  });

  useEffect(() => {
    return subscribe("planned-workouts.updated", (payload) => {
      const p = payload as { traineeId?: string } | undefined;
      if (p?.traineeId === traineeId) {
        void refetchDraftWorkouts();
      }
    });
  }, [subscribe, traineeId, refetchDraftWorkouts]);

  const rightSide = useMemo(
    () => (
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-3">
          <div className="flex w-full items-center gap-2">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface)] hover:text-[var(--shell-ink)]"
              onClick={() => router.push("/app/coach/athletes")}
              aria-label="Back to athletes"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 flex-1 items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
                  Planner
                </p>
                <div className="truncate text-lg font-semibold text-[var(--shell-ink)]">
                  {athleteName}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Tabs
          value={rightSideTab}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="border-b overflow-x-auto border-[var(--shell-border)] bg-[var(--shell-surface)]">
            <SelectionTabs
              items={[
                {
                  key: "exercises",
                  label: "Exercises",
                  onSelect: () => setRightSideTab("exercises"),
                },
                {
                  key: "blocks",
                  label: "Blocks",
                  onSelect: () => setRightSideTab("blocks"),
                },
                {
                  key: "changes",
                  label: (
                    <PlannerChangesTabLabel
                      pendingWorkoutCount={draftWorkouts.length}
                    />
                  ),
                  onSelect: () => setRightSideTab("changes"),
                },
                {
                  key: "ai",
                  label: (
                    <span className="inline-flex items-center gap-1">
                      <SparklesIcon className="h-3 w-3" />
                      AI
                    </span>
                  ),
                  onSelect: () => setRightSideTab("ai"),
                },
              ]}
              activeKey={rightSideTab}
              size="sm"
              fullWidth
              className="w-full"
              itemClassName="text-xs font-semibold uppercase tracking-[0.12em]"
            />
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
            <PlannerChangesPanel
              draftWorkouts={draftWorkouts}
              onDraftsChanged={refetchDraftWorkouts}
            />
          </TabsContent>
          <TabsContent
            value="ai"
            className="mt-0 min-h-0 flex-1 overflow-hidden"
          >
            <AIPlannerPanel
              traineeId={traineeId}
              onGenerated={refetchDraftWorkouts}
            />
          </TabsContent>
        </Tabs>
      </div>
    ),
    [router, athleteName, draftWorkouts, refetchDraftWorkouts, rightSideTab],
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
