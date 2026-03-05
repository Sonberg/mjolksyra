import { useWorkouts } from "./useWorkouts";
import dayjs from "dayjs";
import { Workout } from "./Workout";
import useOnScreen from "@/hooks/useOnScreen";
import { useEffect, useMemo, useState } from "react";
import { uniqBy } from "@/lib/uniqBy";
import { sortBy } from "@/lib/sortBy";
import { SelectionTabs } from "@/components/Navigation/SelectionTabs";
import { useQuery } from "@tanstack/react-query";
import { getPlannedWorkoutById } from "@/services/plannedWorkouts/getPlannedWorkoutById";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultMode = viewerMode === "coach" ? "past" : "future";
  const [mode, setMode] = useState<"past" | "future" | "changes">(
    initialTab ?? defaultMode,
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
  const completed = useWorkouts({
    id: "completed",
    traineeId,
    sortBy: "PlannedAt",
    order: "asc",
    enabled: mode === "past",
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
        : past.hasNextPage || completed.hasNextPage;
  const fetchNextPage = async () => {
    if (mode === "future") {
      await future.fetchNextPage();
      return;
    }

    if (mode === "changes") {
      await changes.fetchNextPage();
      return;
    }

    const actions: Array<Promise<unknown>> = [];
    if (past.hasNextPage) {
      actions.push(past.fetchNextPage());
    }
    if (completed.hasNextPage) {
      actions.push(completed.fetchNextPage());
    }

    if (actions.length > 0) {
      await Promise.all(actions);
    }
  };

  const end = useOnScreen();
  const sourceData = useMemo(() => {
    if (mode === "future") {
      return future.data;
    }

    if (mode === "changes") {
      return changes.data;
    }

    return [...past.data, ...completed.data];
  }, [mode, future.data, changes.data, past.data, completed.data]);

  const data = useMemo(
    () => {
      const startOfToday = dayjs().startOf("day");
      const sorted = sortBy(
        uniqBy(
          [
            ...sourceData,
            ...(focusedWorkout.data ? [focusedWorkout.data] : []),
          ],
          (x) => x.id,
        ).filter((x) => {
          const plannedAt = dayjs(x.plannedAt).startOf("day");
          const isBeforeToday = plannedAt.isBefore(startOfToday);
          const isCompleted = !!x.completedAt;

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

          if (mode === "future") {
            return !isCompleted && !isBeforeToday;
          }

          if (mode === "past" && !(isCompleted || isBeforeToday)) {
            return false;
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
          return dayjs(x.plannedAt);
        },
        mode === "future"
      );

      if (!focusWorkoutId) {
        return sorted;
      }

      const focusedIndex = sorted.findIndex((x) => x.id === focusWorkoutId);
      if (focusedIndex <= 0) {
        return sorted;
      }

      return [sorted[focusedIndex], ...sorted.filter((x) => x.id !== focusWorkoutId)];
    },
    [sourceData, focusedWorkout.data, focusWorkoutId, mode, viewerMode]
  );

  useEffect(() => {
    const next = initialTab ?? defaultMode;
    setMode(next);
  }, [initialTab, defaultMode]);

  useEffect(() => {
    if (!end.isIntersecting) {
      return;
    }

    if (hasNextPage) {
      fetchNextPage();
    }
  }, [end.isIntersecting, hasNextPage, fetchNextPage]);

  function setModeWithUrl(nextMode: "past" | "future" | "changes") {
    setMode(nextMode);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextMode);

    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xl font-bold sm:text-3xl">
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
        <SelectionTabs
          items={[
            {
              key: "future",
              label: "Upcoming",
              onSelect: () => setModeWithUrl("future"),
            },
            {
              key: "past",
              label: "Past",
              onSelect: () => setModeWithUrl("past"),
            },
            ...(viewerMode === "coach"
              ? [
                  {
                    key: "changes" as const,
                    label: "Changes",
                    onSelect: () => setModeWithUrl("changes"),
                  },
                ]
              : []),
          ]}
          activeKey={mode}
          size="md"
          fullWidth
          className="w-full max-w-[34rem]"
        />
      </div>
      <div className="grid gap-4 sm:gap-8">
        {data.map((x) => (
          <Workout
            key={x.id}
            workout={x}
            viewerMode={viewerMode}
            traineeId={traineeId}
            isHighlighted={focusWorkoutId === x.id}
            backTab={mode === "future" || mode === "past" ? mode : undefined}
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
