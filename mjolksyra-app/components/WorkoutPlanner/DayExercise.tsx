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
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { DraggingExercise } from "../DraggingExercise";
import dayjs from "dayjs";
import { PlannedExercise, PlannedWorkout } from "@/api/plannedWorkouts/type";
import { useMonthPlanner } from "./contexts/MonthPlanner";
import { useDebounce } from "@/hooks/useDebounce";

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
  const { update } = useMonthPlanner();
  const [note, setNote] = useState(plannedExercise.note ?? "");

  const debouncedNote = useDebounce(note, 1000);
  const data = useMemo(
    () => ({
      date,
      index,
      plannedWorkout,
      plannedExercise,
      source: "workout",
      type: "plannedExercise",
    }),
    [date, index, plannedWorkout, plannedExercise]
  );

  const {
    setNodeRef,
    attributes,
    listeners,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: `${plannedExercise.id}`,
    data: {
      ...data,
    },
  });

  const className = cn({
    "border-b-0": isLast,
    "opacity-40": isDragging,
  });

  useEffect(() => {
    update({
      ...plannedWorkout,
      exercises: plannedWorkout.exercises.map((x) =>
        x.id == plannedExercise.id
          ? {
              ...x,
              note: debouncedNote,
            }
          : x
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedNote]);

  return useMemo(
    () => (
      <>
        {isDragging
          ? createPortal(
              <DragOverlay>
                <DraggingExercise name={plannedExercise.name} />
              </DragOverlay>,
              document.body
            )
          : null}
        <AccordionItem
          value={plannedExercise.id}
          className={className}
          style={{ transform: CSS.Translate.toString(transform), transition }}
          ref={setNodeRef}
          {...attributes}
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
                      {...listeners}
                      data-action="move"
                      className="h-4 cursor-move  hover:text-zinc-400"
                    />
                    <CopyIcon
                      {...listeners}
                      data-action="clone"
                      className="h-4 cursor-copy hover:text-zinc-400"
                    />
                    <TrashIcon
                      onClick={() => {
                        update({
                          ...plannedWorkout,
                          exercises: plannedWorkout.exercises.filter(
                            (x) => x.id !== plannedExercise.id
                          ),
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
              value={note}
              className=" pt-0"
              placeholder="Sets, reps, tempo etc"
              onChange={(ev) => {
                setNote(ev.target.value);
              }}
            />
          </AccordionContent>
        </AccordionItem>
      </>
    ),
    [
      isDragging,
      plannedExercise.name,
      plannedExercise.id,
      className,
      transform,
      transition,
      setNodeRef,
      attributes,
      listeners,
      note,
      update,
      plannedWorkout,
    ]
  );
}
