import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import { RectangleEllipsisIcon } from "lucide-react";

import { Day } from "./Day";
import { groupBy } from "@/lib/groupBy.";
import { PlannedWorkout } from "@/api/plannedWorkouts/type";
import { PLANNED_AT } from "@/constants/dateFormats";
import { DraggingToolTip } from "../DraggingToolTip";
import { createPortal } from "react-dom";
import { DraggingExercise } from "../DraggingExercise";
import { cn } from "@/lib/utils";
import { draggingStyle } from "@/lib/draggingStyle";

type Props = {
  weekNumber: number;
  days: dayjs.Dayjs[];
  plannedWorkouts: PlannedWorkout[];
};

export function Week({ weekNumber, days, plannedWorkouts }: Props) {
  const data = useMemo(
    () => ({
      days,
      plannedWorkouts,
      weekNumber,
      type: "week",
    }),
    [days, plannedWorkouts]
  );

  const droppable = useDroppable({
    id: weekNumber,
    data,
  });

  const draggable = useDraggable({
    id: weekNumber,
    data,
  });

  const canDrop = droppable.active?.data.current?.type === "week";
  const isOver = droppable.isOver;

  const groupByName = useMemo(
    () => groupBy(days, (x) => x.format("ddd")),
    [days]
  );

  const day = useCallback(
    (dayName: string) => {
      const date = groupByName[dayName]?.[0];

      if (!date) {
        return <div />;
      }

      return (
        <Day
          date={date}
          plannedWorkout={
            plannedWorkouts.find(
              (x) => x.plannedAt == groupByName[dayName]?.[0].format(PLANNED_AT)
            ) ?? null
          }
        />
      );
    },
    [plannedWorkouts, groupByName]
  );

  return useMemo(
    () => (
      <>
        {draggable.isDragging
          ? createPortal(
              <DragOverlay>
                <DraggingExercise name={`w${weekNumber}`} />
              </DragOverlay>,
              document.body
            )
          : null}
        <div ref={droppable.setNodeRef}>
          <div
            className={cn(
              "p-1 px-2 text-sm select-none flex items-center justify-between border bg-accent",
              {
                ...draggingStyle({ canDrop, isOver }),
              }
            )}
          >
            <div>w{weekNumber}</div>
            <div ref={draggable.setNodeRef}>
              {plannedWorkouts.length ? (
                <DraggingToolTip
                  trigger={<RectangleEllipsisIcon className="h-4" />}
                  listeners={draggable.listeners}
                  onDelete={function (): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-7 ">
            {day("Mon")}
            {day("Tue")}
            {day("Wed")}
            {day("Thu")}
            {day("Fri")}
            {day("Sat")}
            {day("Sun")}
          </div>
        </div>
      </>
    ),
    [weekNumber, day, draggable, droppable]
  );
}
