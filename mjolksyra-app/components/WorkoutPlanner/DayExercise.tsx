import { usePlannerStore } from "@/stores/plannerStore";

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
import dayjs from "dayjs";
import { PlannedExercise, PlannedWorkout } from "@/api/plannedWorkouts/type";

type Props = {
  plannedExercise: PlannedExercise;
  plannedWorkout: PlannedWorkout;
  index: number;
  isLast: boolean;
  date: dayjs.Dayjs;
};

export function DayExercise({
  plannedWorkout,
  plannedExercise,
  index,
  isLast,
  date,
}: Props) {
  const store = usePlannerStore();
  const data = useMemo(
    () => ({
      date,
      index,
      plannedWorkout,
      plannedExercise,
      source: "workout",
      type: "plannedExercise",
    }),
    [plannedWorkout, plannedExercise]
  );

  const move = useSortable({
    id: `${plannedExercise.id}-move`,
    data: {
      ...data,
      clone: false,
    },
  });

  const clone = useSortable({
    id: `${plannedExercise.id}-clone`,
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
      value={plannedExercise.id}
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
                      workoutId: plannedWorkout.id,
                      exerciseId: plannedExercise.id,
                    });
                  }}
                  className="h-4 cursor-pointer text-red-500 hover:text-red-800"
                />
              </TooltipContent>,
              document.body
            )}
          </Tooltip>
          <div className="text-sm select-none">{plannedExercise.name}</div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 pb-3">
        <Textarea
          value={plannedExercise.note ?? ""}
          className=" pt-0"
          placeholder="Sets, reps, tempo etc"
          onChange={(ev) => {
            store.updateExercise({
              exerciseId: plannedExercise.id,
              workoutId: plannedWorkout.id,
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
            <DraggingExercise name={plannedExercise.name} />
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
