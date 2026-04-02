"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { SaveIcon } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
} from "@dnd-kit/core";

import { v4 } from "uuid";
import { getBlock } from "@/services/blocks/getBlock";
import { updateBlock } from "@/services/blocks/updateBlock";
import { BlockWorkout } from "@/services/blocks/type";
import { BlockBuilder } from "@/components/BlockBuilder/BlockBuilder";
import { BlockWorkoutEditor } from "@/components/BlockBuilder/BlockWorkoutEditor";
import { ExerciseQuickSearchOverlay } from "@/components/ExerciseLibrary/ExerciseQuickSearchOverlay";
import { DraggingExercise } from "@/components/DraggingExercise";
import { ExerciseLibrary } from "@/components/ExerciseLibrary";
import {
  ExerciseType,
} from "@/lib/exercisePrescription";
import type { Exercise } from "@/services/exercises/type";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { createExercise } from "@/services/exercises/createExercise";
import { deleteExercise } from "@/services/exercises/deleteExercise";
import { getExercises } from "@/services/exercises/getExercises";
import { searchExercises } from "@/services/exercises/searchExercises";
import { starExercises } from "@/services/exercises/starExercise";
import { starredExercises } from "@/services/exercises/starredExercises";
import { CoachWorkspaceShell } from "../../CoachWorkspaceShell";

type Props = {
  blockId: string;
};
type BlockData = NonNullable<Awaited<ReturnType<typeof getBlock>>>;

export function BlockEditorContent({ blockId }: Props) {
  const { data: block, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["blocks", blockId],
    queryFn: () => getBlock({ blockId }),
  });

  if (isLoading) {
    return (
      <CoachWorkspaceShell>
        <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-8 text-[var(--shell-muted)]">
          Loading...
        </div>
      </CoachWorkspaceShell>
    );
  }

  if (!block) {
    return (
      <CoachWorkspaceShell>
        <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-8 text-[var(--shell-muted)]">
          Block not found.
        </div>
      </CoachWorkspaceShell>
    );
  }

  return (
    <BlockEditorWorkspace
      key={`${blockId}:${dataUpdatedAt}`}
      blockId={blockId}
      block={block}
    />
  );
}

type BlockEditorWorkspaceProps = {
  blockId: string;
  block: BlockData;
};

function BlockEditorWorkspace({ blockId, block }: BlockEditorWorkspaceProps) {
  const client = useQueryClient();
  const [name, setName] = useState(block.name);
  const [numberOfWeeks, setNumberOfWeeks] = useState(block.numberOfWeeks);
  const [workouts, setWorkouts] = useState<BlockWorkout[]>(block.workouts);
  const [draggingLabel, setDraggingLabel] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<{
    week: number;
    dayOfWeek: number;
  } | null>(null);
  const [addExerciseTarget, setAddExerciseTarget] = useState<{
    week: number;
    dayOfWeek: number;
  } | null>(null);

  const activeWorkout = useMemo(
    () =>
      selectedWorkout
        ? (workouts.find(
            (w) =>
              w.week === selectedWorkout.week &&
              w.dayOfWeek === selectedWorkout.dayOfWeek,
          ) ?? null)
        : null,
    [selectedWorkout, workouts],
  );

  const saveMutation = useMutation({
    mutationFn: updateBlock,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["blocks"] });
      client.invalidateQueries({ queryKey: ["blocks", blockId] });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      blockId,
      block: { name, numberOfWeeks, workouts },
    });
  };

  const onDragStart = (event: DragStartEvent) => {
    setDraggingLabel(event.active.data.current?.label ?? null);
  };

  const handleAddExerciseFromSearch = (exercise: Exercise) => {
    if (!addExerciseTarget) return;
    const { week, dayOfWeek } = addExerciseTarget;
    const newExercise = {
      id: v4(),
      exerciseId: exercise.id,
      name: exercise.name,
      note: null,
      prescription: {
        type: ExerciseType.SetsReps,
        sets: [
          {
            target: {
              reps: null,
              durationSeconds: null,
              distanceMeters: null,
              weightKg: null,
              note: null,
            },
            actual: null,
          },
        ],
      },
    };
    setWorkouts((prev) => {
      const existing = prev.find(
        (w) => w.week === week && w.dayOfWeek === dayOfWeek,
      );
      if (existing) {
        return prev.map((w) =>
          w.week === week && w.dayOfWeek === dayOfWeek
            ? { ...w, exercises: [...w.exercises, newExercise] }
            : w,
        );
      }
      return [
        ...prev,
        { id: v4(), name: null, note: null, week, dayOfWeek, exercises: [newExercise] },
      ];
    });
  };

  const handleWorkoutUpdate = (updated: BlockWorkout) => {
    setWorkouts((prev) =>
      prev.map((w) =>
        w.week === updated.week && w.dayOfWeek === updated.dayOfWeek ? updated : w,
      ),
    );
  };

  return (
    <CoachWorkspaceShell fullBleed>
      <TooltipProvider>
        <DndContext
          collisionDetection={pointerWithin}
          onDragStart={onDragStart}
          onDragEnd={() => setDraggingLabel(null)}
          onDragCancel={() => setDraggingLabel(null)}
        >
          <div className="overflow-hidden lg:h-[calc(100dvh-7.5rem)] lg:min-h-[680px]">
            <ResizablePanelGroup
              direction="horizontal"
              className="h-full min-h-0"
            >
              <ResizablePanel
                defaultSize={75}
                minSize={50}
                className="min-h-0 overflow-hidden"
              >
                <div className="flex h-full min-h-0 flex-col">
                  <div className="shrink-0 p-6 pb-4 md:p-8 md:pb-5 border-b-2 border-[var(--shell-border)]">
                    <div className="flex items-center gap-3 rounded-none">
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="min-w-0 flex-1 border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-lg font-semibold text-[var(--shell-ink)]"
                        placeholder="Block name"
                      />
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm text-[var(--shell-muted)]">Weeks:</span>
                        <Input
                          type="number"
                          min={1}
                          max={52}
                          value={numberOfWeeks}
                          onChange={(e) => {
                            const nextNumberOfWeeks = Math.max(
                              1,
                              parseInt(e.target.value) || 1,
                            );
                            setNumberOfWeeks(nextNumberOfWeeks);
                            setWorkouts((prev) =>
                              prev.filter(
                                (workout) =>
                                  workout.week >= 1 &&
                                  workout.week <= nextNumberOfWeeks,
                              ),
                            );
                          }}
                          className="w-16 border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]"
                        />
                      </div>
                      <div className="ml-auto flex shrink-0 items-center gap-2">
                        <Button
                          onClick={handleSave}
                          disabled={saveMutation.isPending}
                          size="sm"
                          className="rounded-none border h-10 border-[var(--shell-border)] bg-[var(--shell-accent)] text-[var(--shell-accent-ink)] hover:bg-[var(--shell-accent-hover)]"
                        >
                          <SaveIcon className="mr-2 h-4 w-4" />
                          {saveMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8 md:px-8 pt-8">
                    <BlockBuilder
                      workouts={workouts}
                      numberOfWeeks={numberOfWeeks}
                      onChange={setWorkouts}
                      onEditExercise={(week, dayOfWeek) =>
                        setSelectedWorkout((cur) =>
                          cur?.week === week && cur?.dayOfWeek === dayOfWeek
                            ? null
                            : { week, dayOfWeek },
                        )
                      }
                      onAddExercise={(week, dayOfWeek) =>
                        setAddExerciseTarget({ week, dayOfWeek })
                      }
                      selectedWorkout={selectedWorkout}
                    />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel
                defaultSize={25}
                minSize={0}
                maxSize={50}
                className="min-h-0 overflow-hidden"
              >
                {activeWorkout ? (
                  <BlockWorkoutEditor
                    workout={activeWorkout}
                    onUpdate={handleWorkoutUpdate}
                    onAddExercise={() =>
                      setAddExerciseTarget({
                        week: activeWorkout.week,
                        dayOfWeek: activeWorkout.dayOfWeek,
                      })
                    }
                    onClose={() => setSelectedWorkout(null)}
                  />
                ) : (
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
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
          <ExerciseQuickSearchOverlay
            open={addExerciseTarget !== null}
            onOpenChange={(open) => {
              if (!open) setAddExerciseTarget(null);
            }}
            onSelectExercise={handleAddExerciseFromSearch}
            title="Add exercise"
          />
          {draggingLabel
            ? createPortal(
                <DragOverlay>
                  <DraggingExercise name={draggingLabel} />
                </DragOverlay>,
                document.body,
              )
            : null}
        </DndContext>
      </TooltipProvider>
    </CoachWorkspaceShell>
  );
}
