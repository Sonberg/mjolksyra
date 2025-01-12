import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";

import { Accordion } from "../ui/accordion";
import { DayExercise } from "./DayExercise";
import { useMemo } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlannedWorkout } from "@/api/plannedWorkouts/type";
import { RectangleEllipsisIcon } from "lucide-react";
import { DraggingToolTip } from "../DraggingToolTip";
import { createPortal } from "react-dom";
import { DraggingExercise } from "../DraggingExercise";
import { draggingStyle } from "@/lib/draggingStyle";

const DATE_FORMAT = "YYYY-MM-DD";

type Props = {
  date: dayjs.Dayjs;
  plannedWorkout: PlannedWorkout | null;
};

export function Day({ date, plannedWorkout }: Props) {
  const id = useMemo(() => date.format(DATE_FORMAT), [date]);

  const data = useMemo(
    () => ({
      date,
      plannedWorkout,
      type: "plannedWorkout",
      allowedTypes: ["plannedExercise", "plannedWorkout", "exercise"],
    }),
    [date, plannedWorkout]
  );

  const droppable = useDroppable({
    id,
    data,
  });

  const draggable = useDraggable({
    id,
    data,
  });

  const isOverContainer = !!plannedWorkout?.exercises.find(
    (x) => x.id === droppable.over?.id
  );
  const isOver = isOverContainer || droppable.isOver;
  const canDrop = data.allowedTypes.includes(
    droppable.active?.data.current?.type
  );

  const isToday = useMemo(() => {
    return dayjs().format(DATE_FORMAT) === date?.format(DATE_FORMAT);
  }, [date]);

  const contentClass = cn({
    "flex flex-1 h-full min-h-32 flex-col": true,
    ...draggingStyle({ canDrop, isOver }),
  });

  const dateClass = cn({
    "py-1 px-2 rounded-full select-none": true,
    "bg-red-800 text-white": isToday,
  });

  return useMemo(
    () => (
      <>
        {draggable.isDragging
          ? createPortal(
              <DragOverlay>
                <DraggingExercise name={date.format("dddd, D MMM YYYY")} />
              </DragOverlay>,
              document.body
            )
          : null}
        <SortableContext
          strategy={verticalListSortingStrategy}
          items={plannedWorkout?.exercises ?? []}
        >
          <div className="border-l border-r border-b flex flex-col">
            <div
              className="font-bold text-xs p-2 border-b flex items-center justify-between"
              ref={draggable.setNodeRef}
            >
              <div className={dateClass}>{date.date()}</div>
              {plannedWorkout ? (
                <DraggingToolTip
                  trigger={<RectangleEllipsisIcon className="h-4" />}
                  listeners={draggable.listeners}
                  onDelete={() => {}}
                />
              ) : null}
            </div>
            <div className={contentClass} ref={droppable.setNodeRef}>
              {plannedWorkout?.exercises.length ? (
                <Accordion type="multiple" className="w-full ">
                  {plannedWorkout.exercises.map((x, index) => (
                    <DayExercise
                      key={x.id}
                      index={index}
                      date={date}
                      plannedExercise={x}
                      plannedWorkout={plannedWorkout}
                      isLast={index === plannedWorkout.exercises.length - 1}
                    />
                  ))}
                </Accordion>
              ) : (
                <div className="text-muted-foreground text-sm  place-items-center grid transition-all min-h-32 px-4 text-center opacity-0 hover:opacity-100">
                  <div className="select-none">
                    Drag & drop exercises to start planning
                  </div>
                </div>
              )}
            </div>
          </div>
        </SortableContext>
      </>
    ),
    [plannedWorkout, draggable, droppable, dateClass, date, contentClass]
  );
}
