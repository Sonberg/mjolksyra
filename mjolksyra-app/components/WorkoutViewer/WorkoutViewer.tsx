import { useWorkouts } from "./useWorkouts";
import dayjs from "dayjs";
import { Workout } from "./Workout";
import useOnScreen from "@/hooks/useOnScreen";
import { useEffect, useMemo, useState } from "react";
import { uniqBy } from "@/lib/uniqBy";
import { sortBy } from "@/lib/sortBy";
import { cn } from "@/lib/utils";
import { CustomTab } from "../CustomTab";

type Props = {
  traineeId: string;
};

export function WorkoutViewer({ traineeId }: Props) {
  const [mode, setMode] = useState<"past" | "future">("future");
  const past = useWorkouts({
    id: "past",
    traineeId,
    toDate: dayjs().add(-1, "day"),
    sortBy: "PlannedAt",
    order: "desc",
  });

  const future = useWorkouts({
    id: "future",
    traineeId,
    fromDate: dayjs(),
    sortBy: "PlannedAt",
    order: "asc",
  });

  const hasNextPage = mode === "future" ? future.hasNextPage : past.hasNextPage;
  const fetchNextPage =
    mode === "future" ? future.fetchNextPage : past.fetchNextPage;

  const end = useOnScreen();
  const data = useMemo(
    () =>
      sortBy(
        uniqBy(mode === "future" ? future.data : past.data, (x) => x.id),
        (x) => {
          const [year, month, day] = x.plannedAt.split("-");

          return dayjs()
            .year(Number(year))
            .month(Number(month) - 1)
            .date(Number(day));
        }
      ),
    [past.data, future.data, mode]
  );

  console.log(data);
  

  useEffect(() => {
    if (!end.isIntersecting) {
      return;
    }

    if (hasNextPage) {
      fetchNextPage();
    }
  }, [end.isIntersecting, hasNextPage, fetchNextPage]);

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold">Workouts</div>
        <CustomTab
          value={mode}
          options={[
            { name: "Past", value: "past" },
            { name: "Upcoming", value: "future" },
          ]}
          onSelect={(tab) => setMode(tab.value)}
        />
      </div>
      <div className="grid gap-8">
        {data.map((x) => (
          <Workout key={x.id} workout={x} />
        ))}
      </div>
      {!hasNextPage ? (
        <div className="text-muted text-lg text-center mt-8">
          No more workouts planned
        </div>
      ) : null}
      <div className="w-full h-8 opacity-0" ref={end.measureRef} children="d" />
    </div>
  );
}
