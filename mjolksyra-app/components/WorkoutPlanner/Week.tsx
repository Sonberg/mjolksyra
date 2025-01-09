import dayjs from "dayjs";
import { Day } from "./Day";
import { groupBy } from "@/lib/groupBy.";
import { useCallback, useMemo } from "react";
import { PlannedWorkout } from "@/api/plannedWorkouts/type";
import { PLANNED_AT } from "@/constants/dateFormats";

const FORMAT = "YYYY MM DD";

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

  const isToday = useMemo(() => {
    const now = dayjs().format(FORMAT);
    const today = days.find((x) => x.format(FORMAT) === now);

    return today ? true : false;
  }, [days]);

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
      <div data-today={isToday}>
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
    [isToday, weekNumber, day]
  );
}
