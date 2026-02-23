import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { Week } from "./Week";

import weekYear from "dayjs/plugin/weekYear";
import weekOfYear from "dayjs/plugin/weekOfYear";
import localizedFormat from "dayjs/plugin/localizedFormat";
import updateLocale from "dayjs/plugin/updateLocale";
import { groupBy } from "@/lib/groupBy.";
import { sortBy } from "@/lib/sortBy";
// import { useMonthPlanner } from "./contexts/MonthPlanner";
import { cn } from "@/lib/utils";
import { MonthValue } from "@/hooks/useInfinitMonths";
import { useWorkouts } from "./contexts/Workouts";

dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", { weekStart: 1 });

type Props = {
  value: MonthValue;
};

export function Month({ value }: Props) {
  // const { days, isFetched, startOfMonth } = useMonthPlanner();
  const { data } = useWorkouts();
  const workouts = data[value.monthId];
  const groupedByWeek = useMemo(
    () =>
      sortBy(
        Object.entries(groupBy(value.days, (x) => x.week())),
        ([, val]) => val[0]
      ),
    [value]
  );
  const monthName = useMemo(
    () => value.startOfMonth.format("MMMM YYYY"),
    [value]
  );

  const renderWeek = useCallback(
    ([key, value]: [string, dayjs.Dayjs[]]) => (
      <Week
        key={key}
        weekNumber={Number(key)}
        days={value}
        plannedWorkouts={workouts ?? []}
      />
    ),
    [workouts]
  );

  return useMemo(
    () => (
      <>
        <div
          className={cn({
            "opacity-30": !workouts,
          })}
        >
          <div className="mb-8 select-none text-3xl font-bold text-zinc-100">
            {monthName}
          </div>
          <div className="flex flex-col gap-8">
            {groupedByWeek.map(renderWeek)}
          </div>
        </div>
      </>
    ),
    [workouts, monthName, groupedByWeek, renderWeek]
  );
}
