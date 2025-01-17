import dayjs from "dayjs";
import { useCallback, useId, useMemo } from "react";
import { RectangleEllipsisIcon } from "lucide-react";

import { Day } from "./Day";
import { groupBy } from "@/lib/groupBy.";
import { PlannedWorkout } from "@/api/plannedWorkouts/type";
import { PLANNED_AT } from "@/constants/dateFormats";
import { DraggingToolTip } from "../DraggingToolTip";
import { cn } from "@/lib/utils";
import { draggingStyle } from "@/lib/draggingStyle";
import { useSortable } from "@dnd-kit/sortable";

type Props = {
  weekNumber: number;
  days: dayjs.Dayjs[];
  plannedWorkouts: PlannedWorkout[];
};

export function Week({ weekNumber, days, plannedWorkouts }: Props) {
  const id = useId();
  const data = useMemo(
    () => ({
      days,
      plannedWorkouts,
      weekNumber,
      type: "week",
      label: `w${weekNumber}`,
    }),
    [days, plannedWorkouts, weekNumber]
  );

  const {
    isOver,
    active,
    setDraggableNodeRef,
    setDroppableNodeRef,
    listeners,
  } = useSortable({
    id: `${weekNumber}-${id}`,
    data,
  });

  const canDrop = active?.data.current?.type === "week";
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
      <div ref={setDroppableNodeRef}>
        <div
          className={cn(
            "p-1 px-2 text-sm select-none flex items-center justify-between border bg-accent",
            {
              ...draggingStyle({ canDrop, isOver }),
            }
          )}
        >
          <div>w{weekNumber}</div>
          <div ref={setDraggableNodeRef}>
            {plannedWorkouts.length ? (
              <DraggingToolTip
                icon={<RectangleEllipsisIcon className="h-4" />}
                listeners={listeners}
                onDelete={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-7 border">
          {day("Mon")}
          {day("Tue")}
          {day("Wed")}
          {day("Thu")}
          {day("Fri")}
          {day("Sat")}
          {day("Sun")}
        </div>
      </div>
    ),
    [
      weekNumber,
      day,
      canDrop,
      isOver,
      listeners,
      plannedWorkouts.length,
      setDraggableNodeRef,
      setDroppableNodeRef,
    ]
  );
}
