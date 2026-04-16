"use client";

import { getCompletedWorkouts } from "@/services/completedWorkouts/getCompletedWorkouts";
import { getSkippedWorkouts } from "@/services/plannedWorkouts/getSkippedWorkouts";
import { flatten } from "@/lib/flatten";
import { uniqBy } from "@/lib/uniqBy";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";

type Args = {
  id: string;
  traineeId: string;
  fromDate?: dayjs.Dayjs;
  toDate?: dayjs.Dayjs;
  sortBy: string;
  order: "asc" | "desc";
  enabled: boolean;
};

export function useCompletedWorkouts({
  id,
  traineeId,
  fromDate,
  toDate,
  enabled,
  ...args
}: Args) {
  const skipped = useQuery({
    queryKey: ["skipped-workouts", traineeId],
    queryFn: async ({ signal }) => getSkippedWorkouts({ traineeId, signal }),
    placeholderData: [],
    enabled,
  });

  const initial = useQuery({
    queryKey: [
      "completed-workouts",
      traineeId,
      id,
      "initial",
      fromDate?.format("YYYY-MM-DD") ?? null,
      toDate?.format("YYYY-MM-DD") ?? null,
      args.sortBy,
      args.order,
    ],
    queryFn: async ({ signal }) =>
      await getCompletedWorkouts({
        traineeId,
        signal,
        fromDate,
        toDate,
        limit: 5,
        ...args,
      }),
    placeholderData: {
      data: [],
      next: null,
    },
    enabled,
  });

  const infinit = useInfiniteQuery({
    queryKey: [
      "completed-workouts",
      traineeId,
      id,
      "infinite",
      fromDate?.format("YYYY-MM-DD") ?? null,
      toDate?.format("YYYY-MM-DD") ?? null,
      args.sortBy,
      args.order,
    ],
    queryFn: async ({ pageParam, signal }) => {
      return pageParam
        ? await getCompletedWorkouts({ traineeId, next: pageParam, signal })
        : { data: [], next: null };
    },
    getNextPageParam: (lastPage) => lastPage.next,
    initialPageParam: initial.data?.next,
    enabled: !!initial.data?.next && enabled,
  });

  return useMemo(() => {
    const completedItems = uniqBy(
      [
        ...(initial.data?.data ?? []),
        ...flatten(infinit.data?.pages ?? [], (x) => x.data),
      ],
      (x) => x.id,
    );

    const skippedAsCompleted = (skipped.data ?? []).map((w) => ({
      id: w.id,
      plannedWorkoutId: w.id,
      traineeId: w.traineeId,
      plannedAt: w.plannedAt,
      exercises: [],
      completedAt: null,
      skippedAt: w.skippedAt ?? null,
      media: [],
      createdAt: w.createdAt,
      hasUnreadActivity: false,
    }));

    const merged = uniqBy(
      [...completedItems, ...skippedAsCompleted],
      (x) => x.id,
    ).sort((a, b) => {
      const dateA = a.plannedAt;
      const dateB = b.plannedAt;
      return dateB.localeCompare(dateA);
    });

    return {
      isFetched: infinit.isFetched && initial.isFetched && skipped.isFetched,
      data: merged,
      isFetchingNextPage: infinit.isFetchingNextPage,
      hasNextPage: infinit.hasNextPage,
      fetchNextPage: infinit.fetchNextPage,
    };
  }, [initial, infinit, skipped]);
}
