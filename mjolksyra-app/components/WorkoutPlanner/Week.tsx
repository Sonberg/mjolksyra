import dayjs from "dayjs";
import { useCallback, useId, useMemo } from "react";
import { RectangleEllipsisIcon } from "lucide-react";

import { Day } from "./Day";
import { groupBy } from "@/lib/groupBy.";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { PLANNED_AT } from "@/constants/dateFormats";
import { DraggingToolTip } from "../DraggingToolTip";
import { cn } from "@/lib/utils";
import { draggingStyle } from "@/lib/draggingStyle";
import { useSortable } from "@dnd-kit/sortable";
import { usePlannedWorkoutActions } from "./contexts/PlannedWorkoutActions";
import { useWorkouts } from "./contexts/Workouts";
import { monthId } from "@/lib/monthId";

type Props = {
  weekNumber: number;
  days: dayjs.Dayjs[];
  plannedWorkouts: PlannedWorkout[];
};

export function Week({ weekNumber, days, plannedWorkouts }: Props) {
  const id = useId();
  const actions = usePlannedWorkoutActions();
  const workouts = useWorkouts();
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

  const canDrop =
    active?.data.current?.type === "week" ||
    active?.data.current?.type === "block";
  const groupByName = useMemo(
    () => groupBy(days, (x) => x.format("ddd")),
    [days]
  );
  const appliedBlockSummary = useMemo(() => {
    const applied = plannedWorkouts
      .map((x) => x.appliedBlock)
      .filter((x): x is NonNullable<PlannedWorkout["appliedBlock"]> => !!x);

    if (applied.length === 0) return null;

    const first = applied[0];
    const sameBlock = applied.every(
      (x) =>
        x.blockId === first.blockId &&
        x.weekNumber === first.weekNumber &&
        x.totalWeeks === first.totalWeeks
    );

    if (!sameBlock) {
      return { label: "Mixed blocks" };
    }

    return {
      label: `${first.blockName} · B${first.weekNumber}/${first.totalWeeks}`,
    };
  }, [plannedWorkouts]);

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
      <section
        ref={setDroppableNodeRef}
        className="overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/70 backdrop-blur-sm"
      >
        <div
          className={cn(
            "flex select-none items-center justify-between border-b border-white/10 bg-zinc-900/80 px-3 py-2",
            {
              ...draggingStyle({ canDrop, isOver }),
            }
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="text-sm font-semibold text-zinc-100">Week {weekNumber}</div>
            {appliedBlockSummary ? (
              <div className="max-w-[14rem] truncate rounded-md border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                {appliedBlockSummary.label}
              </div>
            ) : null}
          </div>
          <div ref={setDraggableNodeRef}>
            {plannedWorkouts.length ? (
              <DraggingToolTip
                icon={<RectangleEllipsisIcon className="h-4" />}
                listeners={listeners}
                onDelete={() => {
                  const plannedAts = Object.values(groupByName)
                    .flatMap((x) => x)
                    .map((x) => x.format(PLANNED_AT));

                  for (const plannedAt of plannedAts) {
                    const plannedWorkout = plannedWorkouts.find(
                      (x) => x.plannedAt === plannedAt
                    );

                    if (!plannedWorkout) {
                      continue;
                    }

                    actions.delete({ plannedWorkout });
                    workouts.dispatch({
                      type: "DELETE_WORKOUT",
                      payload: {
                        monthId: monthId(plannedAt),
                        plannedWorkoutId: plannedWorkout.id,
                      },
                    });
                  }
                }}
              />
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-7 divide-x divide-white/10">
          {day("Mon")}
          {day("Tue")}
          {day("Wed")}
          {day("Thu")}
          {day("Fri")}
          {day("Sat")}
          {day("Sun")}
        </div>
      </section>
    ),
    [
      setDroppableNodeRef,
      canDrop,
      isOver,
      weekNumber,
      setDraggableNodeRef,
      plannedWorkouts,
      listeners,
      day,
      groupByName,
      actions,
      workouts,
      appliedBlockSummary,
    ]
  );
}
