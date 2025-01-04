import dayjs from "dayjs";
import { Day } from "./Day";
import { groupBy } from "@/lib/groupBy.";

type Props = {
  weekNumber: number;
  days: dayjs.Dayjs[];
};

export function Week({ weekNumber, days }: Props) {
  const groupByName = groupBy(days, (x) => x.format("ddd"));

  return (
    <div>
      <div className="bg-zinc-900 p-1 px-2 text-sm">v{weekNumber}</div>
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
