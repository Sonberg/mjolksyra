import {
  PlannedExercise,
  PlannedWorkout,
  usePlannerStore,
} from "@/stores/plannerStore";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

import { Textarea } from "../ui/textarea";
import { useSortable } from "@dnd-kit/sortable";
import { CopyIcon, EllipsisVertical, MoveIcon, TrashIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { DragOverlay } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { DraggingExercise } from "../DraggingExercise";

type Props = {
  exercise: PlannedExercise;
  workout: PlannedWorkout;
  index: number;
  isLast: boolean;
};

export function DayExercise({ workout, exercise, index, isLast }: Props) {
  const store = usePlannerStore();
  const data = useMemo(
    () => ({
      index,
      workoutId: workout.id,
      workoutDate: workout.date,
      exerciseId: exercise.exerciseId,
      plannedExerciseId: exercise.id,
      name: exercise.name,
      source: "workout",
      type: "plannedExercise",
    }),
    [workout, exercise]
  );

  const move = useSortable({
    id: `${exercise.id}-move`,
    data: {
      ...data,
      clone: false,
    },
  });

  const clone = useSortable({
    id: `${exercise.id}-clone`,
    data: {
      ...data,
      clone: true,
    },
  });

  const className = cn({
    "border-b-0": isLast,
    "bg-zinc-900": move.isOver,
  });

  const element = (
    <AccordionItem
      value={exercise.id}
      className={className}
      ref={(el) => {
        move.setNodeRef(el);
        clone.setNodeRef(el);
      }}
      {...move.attributes}
    >
      <AccordionTrigger className="text-sm py-2">
        <div className="flex  items-center">
          <Tooltip delayDuration={50}>
            <TooltipTrigger asChild onClick={(ev) => ev.preventDefault()}>
              <EllipsisVertical className="h-3" />
            </TooltipTrigger>

            {createPortal(
              <TooltipContent
                onClick={(ev) => ev.preventDefault()}
                className="flex gap-2 px-1"
              >
                <MoveIcon
                  {...move.listeners}
                  className="h-4 cursor-move  hover:text-zinc-400"
                />
                <CopyIcon
                  {...clone.listeners}
                  className="h-4 cursor-copy hover:text-zinc-400"
                />
                <TrashIcon
                  onClick={() => {
                    store.deleteExercise({
                      workoutId: workout.id,
                      exerciseId: exercise.id,
                    });
                  }}
                  className="h-4 cursor-pointer text-red-500 hover:text-red-800"
                />
              </TooltipContent>,
              document.body
            )}
          </Tooltip>
          <div className="text-sm select-none">{exercise.name}</div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 pb-3">
        <Textarea
          value={exercise.note ?? ""}
          className=" pt-0"
          placeholder="Sets, reps, tempo etc"
          onChange={(ev) => {
            store.updateExercise({
              exerciseId: exercise.id,
              workoutId: workout.id,
              note: ev.target.value,
            });
          }}
        />
      </AccordionContent>
    </AccordionItem>
  );

  const draggingElement =
    move.isDragging || clone.isDragging
      ? createPortal(
          <DragOverlay>
            <DraggingExercise name={exercise.name} />
          </DragOverlay>,
          document.body
        )
      : null;

  return (
    <>
      {draggingElement}
      {move.isDragging ? null : element}
    </>
  );
}
