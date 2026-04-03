"use client";

import { useWorkouts } from "./useWorkouts";
import dayjs from "dayjs";
import { Workout } from "./Workout";
import { useCallback, useEffect, useMemo, useState } from "react";
import { uniqBy } from "@/lib/uniqBy";
import { sortBy } from "@/lib/sortBy";
import { SelectionTabs } from "@/components/Navigation/SelectionTabs";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
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
  const defaultMode = viewerMode === "coach" ? "changes" : "future";
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

  const [endNode, setEndNode] = useState<HTMLDivElement | null>(null);
  const [isEndIntersecting, setIsEndIntersecting] = useState(false);
  const endRef = useCallback((node: HTMLDivElement | null) => {
    setEndNode(node);
    if (!node) {
      setIsEndIntersecting(false);
    }
  }, []);

  useEffect(() => {
    if (!endNode) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsEndIntersecting(entry.isIntersecting);
    });
    observer.observe(endNode);
    return () => observer.disconnect();
  }, [endNode]);
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
            if (viewerMode === "coach") {
              return !!x.completedAt && !x.reviewedAt;
            }

            return !!(x.completedAt || x.reviewedAt);
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

  const emptyState = useMemo(() => {
    if (mode === "changes") {
      return {
        title:
          viewerMode === "coach"
            ? "No workouts need review"
            : "No workouts with changes",
        body:
          viewerMode === "coach"
            ? "Completed sessions that still need coach feedback will appear here."
            : "Completed or updated workouts will appear here when athletes log and review sessions.",
      };
    }

    if (mode === "future") {
      return {
        title: "No upcoming workouts",
        body: "Planned sessions for future dates will appear here.",
      };
    }

    return {
      title: viewerMode === "coach" ? "No reviewed workouts" : "No past workouts",
      body:
        viewerMode === "coach"
          ? "Sessions you already reviewed will appear here."
          : "Completed or previously planned sessions will appear here.",
    };
  }, [mode, viewerMode]);

  useEffect(() => {
    if (!isEndIntersecting) {
      return;
    }

    if (!hasNextPage) {
      return;
    }

    if (mode === "future") {
      void future.fetchNextPage();
      return;
    }

    if (mode === "changes") {
      void changes.fetchNextPage();
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
      void Promise.all(actions);
    }
  }, [
    isEndIntersecting,
    hasNextPage,
    mode,
    future,
    changes,
    past,
    completed,
  ]);

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
      <PageSectionHeader
        className="mb-4"
        titleClassName="text-xl md:text-2xl"
        title={
          viewerMode === "coach"
            ? mode === "future"
              ? "Upcoming workouts"
              : mode === "changes"
                ? "Needs review"
                : "Reviewed workouts"
            : mode === "future"
              ? "Upcoming workouts"
              : "Past workouts"
        }
        actions={
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
                        label: "Needs review",
                        onSelect: () => setModeWithUrl("changes"),
                      },
                    ]
                : []),
            ]}
            activeKey={mode}
            size="md"
            fullWidth={viewerMode !== "coach"}
            className="w-full max-w-[34rem]"
            itemClassName={viewerMode === "coach" ? "px-3 text-sm" : undefined}
          />
        }
      />

      <div className="grid gap-4 sm:gap-8">
        {data.length === 0 ? (
          <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-6 py-8 text-center">
            <p className="text-lg font-semibold text-[var(--shell-ink)]">
              {emptyState.title}
            </p>
            <p className="mt-2 text-sm text-[var(--shell-muted)]">
              {emptyState.body}
            </p>
          </section>
        ) : (
          data.map((x) => (
            <Workout
              key={x.id}
              workout={x}
              viewerMode={viewerMode}
              traineeId={traineeId}
              isHighlighted={focusWorkoutId === x.id}
              backTab={mode}
            />
          ))
        )}
      </div>
      {data.length > 0 && !hasNextPage ? (
        <div className="text-muted text-lg text-center mt-8">
          {mode === "changes"
            ? viewerMode === "coach"
              ? "No workouts currently need review"
              : "No workouts with changes"
            : "No more workouts planned"}
        </div>
      ) : null}
      <div className="w-full h-8 opacity-0" ref={endRef} children="d" />
    </>
  );
}
