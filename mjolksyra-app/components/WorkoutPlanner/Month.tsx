import dayjs from "dayjs";
import { useMemo } from "react";
import { Week } from "./Week";
import { WeekDayNames } from "./WeekDayNames";
import { getDatesBetween } from "@/lib/getDatesBetween";

import weekYear from "dayjs/plugin/weekYear";
import weekOfYear from "dayjs/plugin/weekOfYear";
import localizedFormat from "dayjs/plugin/localizedFormat";
import updateLocale from "dayjs/plugin/updateLocale";
import { groupBy } from "@/lib/groupBy.";
import { usePlannerStore } from "@/stores/plannerStore";
import { sortBy } from "@/lib/sortBy";
import { useMonthPlanner } from "./hooks/useMonthPlanner";
import useOnScreen from "@/hooks/useOnScreen";

dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", { weekStart: 1 });

type MonthProps = {
  traineeId: string;
  month: number;
  year: number;
};

export function Month({ traineeId, month, year }: MonthProps) {
  const { measureRef, isIntersecting } = useOnScreen();

  const startOfMonth = useMemo(
    () => dayjs().date(1).year(year).month(month).startOf("month"),
    [month, year]
  );

  const endOfMonth = useMemo(() => startOfMonth.endOf("month"), [startOfMonth]);
  const planner = useMonthPlanner({
    traineeId,
    startOfMonth,
    endOfMonth,
    isVisible: isIntersecting,
  });

  const days = useMemo(
    () => getDatesBetween(startOfMonth, endOfMonth),
    [startOfMonth, endOfMonth]
  );

  const groupedByWeek = useMemo(
    () =>
      sortBy(
        Object.entries(groupBy(days, (x) => x.week())),
        ([_, val]) => val[0]
      ),
    [days]
  );
  const monthName = useMemo(
    () => startOfMonth.format("MMMM YYYY"),
    [startOfMonth]
  );
  const store = usePlannerStore();

  return useMemo(
    () => (
      <>
        <div ref={measureRef}>
          <div
            className="text-3xl font-bold mb-8 select-none"
            data-month={month}
            data-year={year}
          >
            {monthName}
          </div>
          <WeekDayNames />
          <div className="flex flex-col gap-8 ">
            {groupedByWeek.map(([key, value]) => (
              <Week
                key={key}
                weekNumber={Number(key)}
                days={value}
                plannedWorkouts={planner.workouts}
              />
            ))}
          </div>
        </div>
      </>
    ),
    [monthName, groupedByWeek, planner]
  );
}
