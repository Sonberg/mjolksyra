import dayjs from "dayjs";
import { Day } from "./Day";
import { groupBy } from "@/lib/groupBy.";
import { useCallback, useMemo } from "react";
import { PlannedWorkout } from "@/api/plannedWorkouts/type";
import { PLANNED_AT } from "@/constants/dateFormats";

type Props = {
  weekNumber: number;
  days: dayjs.Dayjs[];
  plannedWorkouts: PlannedWorkout[];
};

export function Week({ weekNumber, days, plannedWorkouts }: Props) {
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
      <div>
        <div className="bg-accent p-1 px-2 text-sm select-none">
          v{weekNumber}
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
    ),
    [weekNumber, day]
  );
}
