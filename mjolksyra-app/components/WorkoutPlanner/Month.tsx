import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { Week } from "./Week";
import { WeekDayNames } from "./WeekDayNames";
import { getDatesBetween } from "@/lib/getDatesBetween";

import weekYear from "dayjs/plugin/weekYear";
import weekOfYear from "dayjs/plugin/weekOfYear";
import localizedFormat from "dayjs/plugin/localizedFormat";
import updateLocale from "dayjs/plugin/updateLocale";
import { groupBy } from "@/lib/groupBy.";
import { sortBy } from "@/lib/sortBy";
import { useMonthPlanner } from "./contexts/MonthPlanner";
import { cn } from "@/lib/utils";

dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", { weekStart: 1 });

export function Month() {
  const { startOfMonth, endOfMonth, workouts, isFetched } = useMonthPlanner();

  const days = useMemo(
    () => getDatesBetween(startOfMonth, endOfMonth),
    [startOfMonth, endOfMonth]
  );

  const groupedByWeek = useMemo(
    () =>
      sortBy(
        Object.entries(groupBy(days, (x) => x.week())),
        ([, val]) => val[0]
      ),
    [days]
  );
  const monthName = useMemo(
    () => startOfMonth.format("MMMM YYYY"),
    [startOfMonth]
  );

  const renderWeek = useCallback(
    ([key, value]: [string, dayjs.Dayjs[]]) => (
      <Week
        key={key}
        weekNumber={Number(key)}
        days={value}
        plannedWorkouts={workouts}
      />
    ),
    [workouts]
  );

  return useMemo(
    () => (
      <>
        <div
          className={cn({
            "opacity-30": !isFetched,
          })}
        >
          <div className="text-3xl font-bold mb-8 select-none">{monthName}</div>
          <WeekDayNames />
          <div className="flex flex-col gap-8 ">
            {groupedByWeek.map(renderWeek)}
          </div>
        </div>
      </>
    ),
    [isFetched, monthName, groupedByWeek, renderWeek]
  );
}
