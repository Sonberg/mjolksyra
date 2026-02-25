"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeftIcon, SaveIcon } from "lucide-react";
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

type Props = {
  blockId: string;
};

export function BlockEditorContent({ blockId }: Props) {
  const router = useRouter();
  const client = useQueryClient();

  const { data: block, isLoading } = useQuery({
    queryKey: ["blocks", blockId],
    queryFn: () => getBlock({ blockId }),
  });

  const [name, setName] = useState("");
  const [numberOfWeeks, setNumberOfWeeks] = useState(4);
  const [workouts, setWorkouts] = useState<BlockWorkout[]>([]);
  const [draggingLabel, setDraggingLabel] = useState<string | null>(null);

  useEffect(() => {
    if (block) {
      setName(block.name);
      setNumberOfWeeks(block.numberOfWeeks);
      setWorkouts(block.workouts);
    }
  }, [block]);

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

  if (isLoading) {
    return (
      <CoachWorkspaceShell>
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-8 text-zinc-400">
          Loading...
        </div>
      </CoachWorkspaceShell>
    );
  }

  if (!block) {
    return (
      <CoachWorkspaceShell>
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-8 text-zinc-400">
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
          <ResizablePanelGroup
            direction="horizontal"
            className="h-[calc(100vh-14rem)] min-h-[680px]"
          >
            <ResizablePanel
              defaultSize={75}
              minSize={50}
              className="min-h-0 overflow-hidden"
            >
              <div className="flex h-full min-h-0 flex-col">
                <div className="shrink-0 p-6 pb-4 md:p-8 md:pb-5">
                  <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-3">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="max-w-xs border-white/15 bg-zinc-900/80 text-lg font-semibold text-zinc-100"
                      placeholder="Block name"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-400">Weeks:</span>
                      <Input
                        type="number"
                        min={1}
                        max={52}
                        value={numberOfWeeks}
                        onChange={(e) =>
                          setNumberOfWeeks(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="w-20 border-white/15 bg-zinc-900/80 text-zinc-100"
                      />
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={saveMutation.isPending}
                      size="sm"
                      className="border border-white/15 bg-white text-black hover:bg-zinc-200"
                    >
                      <SaveIcon className="h-4 w-4 mr-2" />
                      {saveMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 md:px-8">
                  <BlockBuilder
                    workouts={workouts}
                    numberOfWeeks={numberOfWeeks}
                    onChange={setWorkouts}
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
            </ResizablePanel>
          </ResizablePanelGroup>
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
