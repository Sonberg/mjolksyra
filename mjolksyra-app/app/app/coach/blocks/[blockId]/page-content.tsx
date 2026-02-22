"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeftIcon, SaveIcon } from "lucide-react";

import { getBlock } from "@/services/blocks/getBlock";
import { updateBlock } from "@/services/blocks/updateBlock";
import { BlockWorkout } from "@/services/blocks/type";
import { BlockBuilder } from "@/components/BlockBuilder/BlockBuilder";
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

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading...</div>;
  }

  if (!block) {
    return <div className="p-8 text-muted-foreground">Block not found.</div>;
  }

  return (
    <TooltipProvider>
      <ResizablePanelGroup direction="horizontal" className="h-screen">
        <ResizablePanel defaultSize={75} minSize={50} className="overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                className="rounded-full p-2 hover:bg-accent"
                onClick={() => router.push("/app/coach/blocks")}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg font-semibold max-w-xs"
                placeholder="Block name"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Weeks:</span>
                <Input
                  type="number"
                  min={1}
                  max={52}
                  value={numberOfWeeks}
                  onChange={(e) =>
                    setNumberOfWeeks(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-20"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                size="sm"
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>

            <BlockBuilder
              workouts={workouts}
              numberOfWeeks={numberOfWeeks}
              onChange={setWorkouts}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={25} minSize={0} maxSize={50} className="overflow-visible">
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
    </TooltipProvider>
  );
}
