import { useWorkouts } from "./useWorkouts";
import dayjs from "dayjs";
import { Workout } from "./Workout";
import useOnScreen from "@/hooks/useOnScreen";
import { useEffect, useMemo, useState } from "react";
import { uniqBy } from "@/lib/uniqBy";
import { sortBy } from "@/lib/sortBy";
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
    order: "asc",
    enabled: mode === "past",
  });

  const future = useWorkouts({
    id: "future",
    traineeId,
    fromDate: dayjs(),
    sortBy: "PlannedAt",
    order: "asc",
    enabled: mode === "future",
  });

  const hasNextPage = mode === "future" ? future.hasNextPage : past.hasNextPage;
  const fetchNextPage =
    mode === "future" ? future.fetchNextPage : past.fetchNextPage;

  const end = useOnScreen();
  const data = useMemo(
    () =>
      sortBy(
        uniqBy(mode === "future" ? future.data : past.data, (x) => x.id).filter(
          (x) => x.exercises.length > 0 || !!x.note?.trim(),
        ),
        (x) => {
          const [year, month, day] = x.plannedAt.split("-");

          return dayjs()
            .year(Number(year))
            .month(Number(month) - 1)
            .date(Number(day));
        },
        mode == "future"
      ),
    [past.data, future.data, mode]
  );

  useEffect(() => {
    if (!end.isIntersecting) {
      return;
    }

    if (hasNextPage) {
      fetchNextPage();
    }
  }, [end.isIntersecting, hasNextPage, fetchNextPage]);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-3xl font-bold">
          {mode === "future" ? "Upcoming workouts" : "Past workouts"}
        </div>
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
    </>
  );
}
