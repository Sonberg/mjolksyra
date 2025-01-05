import dayjs from "dayjs";
import { Day } from "./Day";
import { groupBy } from "@/lib/groupBy.";
import { useMemo } from "react";

const FORMAT = "YYYY MM DD";

type Props = {
  weekNumber: number;
  days: dayjs.Dayjs[];
};

export function Week({ weekNumber, days }: Props) {
  const groupByName = useMemo(
    () => groupBy(days, (x) => x.format("ddd")),
    [days]
  );

  const isToday = useMemo(() => {
    const now = dayjs().format(FORMAT);
    const today = days.find((x) => x.format(FORMAT) === now);

    return today ? true : false;
  }, [days]);

  return (
    <div data-today={isToday}>
      <div className="bg-accent p-1 px-2 text-sm select-none">v{weekNumber}</div>
      <div className="grid grid-cols-7 ">
        <Day date={groupByName["Mon"]?.[0]} />
        <Day date={groupByName["Tue"]?.[0]} />
        <Day date={groupByName["Wed"]?.[0]} />
        <Day date={groupByName["Thu"]?.[0]} />
        <Day date={groupByName["Fri"]?.[0]} />
        <Day date={groupByName["Sat"]?.[0]} />
        <Day date={groupByName["Sun"]?.[0]} />
      </div>
    </div>
  );
}
