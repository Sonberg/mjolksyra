import { useWorkouts } from "./useWorkouts";
import dayjs from "dayjs";
import { Workout } from "./Workout";
import useOnScreen from "@/hooks/useOnScreen";
import { useEffect, useMemo } from "react";
import { uniqBy } from "@/lib/uniqBy";
import { sortBy } from "@/lib/sortBy";
import { cn } from "@/lib/utils";

type Props = {
  traineeId: string;
};

export function WorkoutViewer({ traineeId }: Props) {
  const past = useWorkouts({
    id: "past",
    traineeId,
    toDate: dayjs(),
    sortBy: "PlannedAt",
    order: "asc",
  });

  const future = useWorkouts({
    id: "future",
    traineeId,
    fromDate: dayjs(),
    sortBy: "PlannedAt",
    order: "asc",
  });

  const start = useOnScreen();
  const end = useOnScreen();
  const data = useMemo(
    () =>
      sortBy(
        uniqBy([...past.data, ...future.data], (x) => x.id),
        (x) => {
          const [year, month, day] = x.plannedAt.split("-");

          return dayjs()
            .year(Number(year))
            .month(Number(month) - 1)
            .date(Number(day));
        }
      ),
    [past.data, future.data]
  );

  useEffect(() => {
    if (!end.isIntersecting) {
      return;
    }

    if (!future.hasNextPage) {
      return;
    }

    console.log("load next future");

    future.fetchNextPage();
  }, [end.isIntersecting, future]);

  useEffect(() => {
    if (!start.isIntersecting) {
      return;
    }

    if (!past.hasNextPage) {
      return;
    }

    console.log("load next past");

    past.fetchNextPage();
  }, [start.isIntersecting, past]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    document
      .querySelectorAll('[data-today="true"]')
      .forEach((el) =>
        el.scrollIntoView({ behavior: "instant", block: "center" })
      );
  }, [past.isFetched, future.isFetched]);

  const className = cn({
    "overflow-y-auto": true,
    "p-6": true,
    grid: true,
    "gap-8": true,
    "opacity-0": !past.isFetched || !future.isFetched,
  });

  return (
    <div className={className}>
      <div
        className="w-full h-8 text-background"
        ref={start.measureRef}
        children="d"
      />

      {data.map((x) => (
        <Workout key={x.id} workout={x} />
      ))}

      {!future.hasNextPage ? (
        <div className="text-muted text-lg">No more workouts planned</div>
      ) : null}

      <div
        className="w-full h-8 text-background"
        ref={end.measureRef}
        children="d"
      />
    </div>
  );
}
