"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { SaveIcon } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
} from "@dnd-kit/core";

import { getBlock } from "@/services/blocks/getBlock";
import { updateBlock } from "@/services/blocks/updateBlock";
import { BlockWorkout } from "@/services/blocks/type";
import { BlockBuilder } from "@/components/BlockBuilder/BlockBuilder";
import { DraggingExercise } from "@/components/DraggingExercise";
import { ExerciseLibrary } from "@/components/ExerciseLibrary";
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
import { BlockExerciseSidebar } from "@/components/BlockBuilder/BlockExerciseSidebar";
import { ExercisePrescription } from "@/lib/exercisePrescription";

type Props = {
  blockId: string;
};

type SelectedBlockExercise = {
  week: number;
  dayOfWeek: number;
  exerciseId: string;
};

type BlockInteractionMode = "arrange" | "edit";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function BlockEditorContent({ blockId }: Props) {
  const client = useQueryClient();

  const { data: block, isLoading } = useQuery({
    queryKey: ["blocks", blockId],
    queryFn: () => getBlock({ blockId }),
  });

  const [name, setName] = useState("");
  const [numberOfWeeks, setNumberOfWeeks] = useState(4);
  const [workouts, setWorkouts] = useState<BlockWorkout[]>([]);
  const [draggingLabel, setDraggingLabel] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] =
    useState<SelectedBlockExercise | null>(null);
  const [interactionMode, setInteractionMode] =
    useState<BlockInteractionMode>("arrange");

  useEffect(() => {
    if (block) {
      setName(block.name);
      setNumberOfWeeks(block.numberOfWeeks);
      setWorkouts(block.workouts);
      setSelectedExercise(null);
      setInteractionMode("arrange");
    }
  }, [block]);

  const selectedWorkout = useMemo(() => {
    if (!selectedExercise) {
      return null;
    }

    return (
      workouts.find(
        (workout) =>
          workout.week === selectedExercise.week &&
          workout.dayOfWeek === selectedExercise.dayOfWeek,
      ) ?? null
    );
  }, [selectedExercise, workouts]);

  const selectedExerciseEntry = useMemo(() => {
    if (!selectedExercise || !selectedWorkout) {
      return null;
    }

    return (
      selectedWorkout.exercises.find((exercise) => exercise.id === selectedExercise.exerciseId) ??
      null
    );
  }, [selectedExercise, selectedWorkout]);

  useEffect(() => {
    if (selectedExercise && !selectedExerciseEntry) {
      setSelectedExercise(null);
    }
  }, [selectedExercise, selectedExerciseEntry]);

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

    const dragType = event.active.data.current?.type;
    if (
      interactionMode === "edit" &&
      (dragType === "exercise" || dragType === "blockExercise")
    ) {
      setInteractionMode("arrange");
      setSelectedExercise(null);
    }
  };

  const handleUpdateSelectedExerciseNote = (note: string | null) => {
    if (!selectedExercise) {
      return;
    }

    setWorkouts((state) =>
      state.map((workout) => {
        if (
          workout.week !== selectedExercise.week ||
          workout.dayOfWeek !== selectedExercise.dayOfWeek
        ) {
          return workout;
        }

        return {
          ...workout,
          exercises: workout.exercises.map((exercise) =>
            exercise.id === selectedExercise.exerciseId ? { ...exercise, note } : exercise,
          ),
        };
      }),
    );
  };

  const handleUpdateSelectedExercisePrescription = (
    prescription: ExercisePrescription | null,
  ) => {
    if (!selectedExercise) {
      return;
    }

    setWorkouts((state) =>
      state.map((workout) => {
        if (
          workout.week !== selectedExercise.week ||
          workout.dayOfWeek !== selectedExercise.dayOfWeek
        ) {
          return workout;
        }

        return {
          ...workout,
          exercises: workout.exercises.map((exercise) =>
            exercise.id === selectedExercise.exerciseId
              ? { ...exercise, prescription }
              : exercise,
          ),
        };
      }),
    );
  };

  if (isLoading) {
    return (
      <CoachWorkspaceShell>
        <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-8 text-[var(--shell-muted)]">
          Loading...
        </div>
      </CoachWorkspaceShell>
    );
  }

  if (!block) {
    return (
      <CoachWorkspaceShell>
        <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-8 text-[var(--shell-muted)]">
          Block not found.
        </div>
      </CoachWorkspaceShell>
    );
  }

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
                <div className="shrink-0 p-6 pb-4 md:p-8 md:pb-5">
                  <div className="flex items-center gap-3 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-3">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="min-w-0 flex-1 border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-lg font-semibold text-[var(--shell-ink)]"
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
                          const nextNumberOfWeeks = Math.max(1, parseInt(e.target.value) || 1);
                          setNumberOfWeeks(nextNumberOfWeeks);
                          setWorkouts((prev) =>
                            prev.filter((workout) => workout.week >= 1 && workout.week <= nextNumberOfWeeks)
                          );
                        }}
                        className="w-16 border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]"
                      />
                    </div>
                    <div className="ml-auto flex shrink-0 items-center gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        size="sm"
                        className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-accent)] text-[var(--shell-surface)] hover:bg-[#ce2f10]"
                      >
                        <SaveIcon className="mr-2 h-4 w-4" />
                        {saveMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <div className="flex items-center overflow-hidden rounded-none border-2 border-[var(--shell-border)]">
                        <button
                          type="button"
                          onClick={() => {
                            setInteractionMode("arrange");
                            setSelectedExercise(null);
                          }}
                          className={
                            interactionMode === "arrange"
                              ? "px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] bg-[var(--shell-ink)] text-[var(--shell-surface)]"
                              : "px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]"
                          }
                        >
                          Arrange
                        </button>
                        <button
                          type="button"
                          onClick={() => setInteractionMode("edit")}
                          className={
                            interactionMode === "edit"
                              ? "px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] bg-[var(--shell-ink)] text-[var(--shell-surface)]"
                              : "px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]"
                          }
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8 md:px-8">
                  <BlockBuilder
                    workouts={workouts}
                    numberOfWeeks={numberOfWeeks}
                    onChange={setWorkouts}
                    onEditExercise={(week, dayOfWeek, exerciseId) =>
                      interactionMode === "edit"
                        ? setSelectedExercise((current) => {
                            if (
                              current?.week === week &&
                              current?.dayOfWeek === dayOfWeek &&
                              current?.exerciseId === exerciseId
                            ) {
                              return null;
                            }

                            return { week, dayOfWeek, exerciseId };
                          })
                        : null
                    }
                    activeExerciseId={selectedExercise?.exerciseId ?? null}
                    mode={interactionMode}
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
                {selectedExerciseEntry && selectedExercise ? (
                  <BlockExerciseSidebar
                    title={`Week ${selectedExercise.week} · ${DAY_NAMES[selectedExercise.dayOfWeek - 1]}`}
                    exercise={selectedExerciseEntry}
                    onUpdateNote={handleUpdateSelectedExerciseNote}
                    onUpdatePrescription={handleUpdateSelectedExercisePrescription}
                    onClose={() => setSelectedExercise(null)}
                  />
                ) : (
                  <>
                    {interactionMode === "edit" ? (
                      <div className="border-b-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-6 py-6">
                        <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                          Edit mode
                        </div>
                        <div className="mt-2 text-sm text-[var(--shell-ink)]">
                          Click an exercise card to edit notes and set targets.
                        </div>
                      </div>
                    ) : null}
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
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
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
