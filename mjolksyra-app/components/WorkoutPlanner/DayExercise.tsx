import dayjs from "dayjs";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { DragOverlay } from "@dnd-kit/core";
import { EllipsisVertical } from "lucide-react";
import { useMemo, useState } from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

import { Textarea } from "../ui/textarea";
import { DraggingExercise } from "../DraggingExercise";
import { PlannedExercise, PlannedWorkout } from "@/api/plannedWorkouts/type";
import { useMonthPlanner } from "./contexts/MonthPlanner";
import { useDebounce } from "@/hooks/useDebounce";
import { DraggingToolTip } from "../DraggingToolTip";

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

  const updateNote = useDebounce((note: string) => {
    update({
      ...plannedWorkout,
      exercises: plannedWorkout.exercises.map((x) =>
        x.id == plannedExercise.id
          ? {
              ...x,
              note,
            }
          : x
      ),
    });
  }, 1000);

  const data = useMemo(
    () => ({
      date,
      index,
      plannedWorkout,
      plannedExercise,
      source: "workout",
      type: "plannedExercise",
      allowedTypes: ["plannedExercise"],
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
            <div className="flex items-center gap-1">
              <DraggingToolTip
                listeners={listeners}
                trigger={<EllipsisVertical className="h-4" />}
                onDelete={() => {
                  update({
                    ...plannedWorkout,
                    exercises: plannedWorkout.exercises.filter(
                      (x) => x.id !== plannedExercise.id
                    ),
                  });
                }}
              />
              <div className="text-sm select-none text-left">
                {plannedExercise.name}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-3">
            <Textarea
              value={note}
              className=" pt-0"
              placeholder="Sets, reps, tempo etc"
              onChange={(ev) => {
                setNote(ev.target.value);
                updateNote(ev.target.value);
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
