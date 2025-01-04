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

dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", { weekStart: 1 });

type MonthProps = {
  month: number;
  year: number;
};

export function Month({ month, year }: MonthProps) {
  const startDate = useMemo(
    () => dayjs().date(1).year(year).month(month).startOf("month"),
    [month, year]
  );

  const endOfMonth = useMemo(() => startDate.endOf("month"), [startDate]);

  const days = useMemo(
    () => getDatesBetween(startDate, endOfMonth),
    [startDate, endOfMonth]
  );

  const groupedByWeek = useMemo(() => groupBy(days, (x) => x.week()), [days]);
  const monthName = useMemo(() => startDate.format("MMMM YYYY"), [startDate]);

  return (
    <>
      <div>
        <div
          className="text-3xl font-bold mb-8"
          data-month={month}
          data-year={year}
        >
          {monthName}
        </div>
        <WeekDayNames />
        <div className="flex flex-col gap-8 ">
          {Object.keys(groupedByWeek).map((key) => (
            <Week
              key={key}
              weekNumber={Number(key)}
              days={groupedByWeek[Number(key)]}
            />
          ))}
        </div>
      </div>
    </>
  );
}
