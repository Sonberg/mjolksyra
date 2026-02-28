import { useWorkouts } from "./useWorkouts";
import dayjs from "dayjs";
import { Workout } from "./Workout";
import useOnScreen from "@/hooks/useOnScreen";
import { useEffect, useMemo, useState } from "react";
import { uniqBy } from "@/lib/uniqBy";
import { sortBy } from "@/lib/sortBy";
import { CustomTab } from "../CustomTab";
import { useQuery } from "@tanstack/react-query";
import { getPlannedWorkoutById } from "@/services/plannedWorkouts/getPlannedWorkoutById";

type Props = {
  traineeId: string;
  mode?: "athlete" | "coach";
  initialTab?: "past" | "future" | "changes";
  focusWorkoutId?: string | null;
};

export function WorkoutViewer({
  traineeId,
  mode: viewerMode = "athlete",
  initialTab,
  focusWorkoutId,
}: Props) {
  const [mode, setMode] = useState<"past" | "future" | "changes">(
    initialTab ?? (viewerMode === "coach" ? "past" : "future"),
  );
  const past = useWorkouts({
    id: "past",
    traineeId,
    toDate: dayjs().add(-1, "day"),
    sortBy: "PlannedAt",
    order: "asc",
    enabled: mode === "past",
  });

  const changes = useWorkouts({
    id: "changes",
    traineeId,
    sortBy: "PlannedAt",
    order: "desc",
    enabled: mode === "changes",
  });

  const future = useWorkouts({
    id: "future",
    traineeId,
    fromDate: dayjs(),
    sortBy: "PlannedAt",
    order: "asc",
    enabled: mode === "future",
  });

  const focusedWorkout = useQuery({
    queryKey: ["planned-workout", traineeId, focusWorkoutId],
    queryFn: async ({ signal }) =>
      getPlannedWorkoutById({
        traineeId,
        plannedWorkoutId: focusWorkoutId!,
        signal,
      }),
    enabled: !!focusWorkoutId,
    retry: false,
  });

  const hasNextPage =
    mode === "future"
      ? future.hasNextPage
      : mode === "changes"
        ? changes.hasNextPage
        : past.hasNextPage;
  const fetchNextPage =
    mode === "future"
      ? future.fetchNextPage
      : mode === "changes"
        ? changes.fetchNextPage
        : past.fetchNextPage;

  const end = useOnScreen();
  const sourceData = useMemo(() => {
    if (mode === "future") {
      return future.data;
    }

    if (mode === "changes") {
      return changes.data;
    }

    return past.data;
  }, [mode, future.data, changes.data, past.data]);

  const data = useMemo(
    () =>
      sortBy(
        uniqBy(
          [
            ...sourceData,
            ...(focusedWorkout.data ? [focusedWorkout.data] : []),
          ],
          (x) => x.id,
        ).filter((x) => {
          if (focusWorkoutId && x.id === focusWorkoutId) {
            return true;
          }

          if (mode === "changes") {
            return !!(
              x.completedAt ||
              x.reviewedAt ||
              x.completionNote?.trim() ||
              x.reviewNote?.trim()
            );
          }

          const visible =
            x.exercises.length > 0 ||
            !!x.note?.trim() ||
            !!x.completionNote?.trim() ||
            !!x.completedAt;

          if (!visible) {
            return false;
          }

          if (viewerMode === "coach" && !x.completedAt) {
            return false;
          }

          return true;
        }),
        (x) => {
          const [year, month, day] = x.plannedAt.split("-");

          return dayjs()
            .year(Number(year))
            .month(Number(month) - 1)
            .date(Number(day));
        },
        mode === "future"
      ),
    [sourceData, focusedWorkout.data, focusWorkoutId, mode, viewerMode]
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
          {viewerMode === "coach"
            ? mode === "future"
              ? "Upcoming workouts"
              : mode === "changes"
                ? "Workouts with changes"
              : "Completed workouts"
            : mode === "future"
              ? "Upcoming workouts"
              : "Past workouts"}
        </div>
        <CustomTab
          value={mode}
          options={[
            { name: "Past", value: "past" },
            { name: "Upcoming", value: "future" },
            ...(viewerMode === "coach"
              ? [{ name: "Changes", value: "changes" as const }]
              : []),
          ]}
          onSelect={(tab) => setMode(tab.value)}
        />
      </div>
      <div className="grid gap-8">
        {data.map((x) => (
          <Workout
            key={x.id}
            workout={x}
            viewerMode={viewerMode}
            isHighlighted={focusWorkoutId === x.id}
          />
        ))}
      </div>
      {!hasNextPage ? (
        <div className="text-muted text-lg text-center mt-8">
          {mode === "changes"
            ? "No workouts with changes"
            : "No more workouts planned"}
        </div>
      ) : null}
      <div className="w-full h-8 opacity-0" ref={end.measureRef} children="d" />
    </>
  );
}
