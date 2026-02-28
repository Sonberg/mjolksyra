import { getPlannedWorkouts } from "@/services/plannedWorkouts/getPlannedWorkout";
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

export function useWorkouts({
  id,
  traineeId,
  fromDate,
  toDate,
  enabled,
  ...args
}: Args) {
  const initial = useQuery({
    queryKey: [
      "planned-workouts",
      traineeId,
      id,
      "initial",
      fromDate?.format("YYYY-MM-DD") ?? null,
      toDate?.format("YYYY-MM-DD") ?? null,
      args.sortBy,
      args.order,
    ],
    queryFn: async ({ signal }) =>
      await getPlannedWorkouts({
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
    enabled: enabled,
  });

  const infinit = useInfiniteQuery({
    queryKey: [
      "planned-workouts",
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
        ? await getPlannedWorkouts({ traineeId, next: pageParam, signal })
        : { data: [], next: null };
    },
    getNextPageParam: (lastPage) => lastPage.next,
    initialPageParam: initial.data?.next,
    enabled: !!initial.data?.next && enabled,
  });

  return useMemo(
    () => ({
      isFetched: infinit.isFetched && initial.isFetched,
      data: uniqBy(
        [
          ...(initial.data?.data ?? []),
          ...flatten(infinit.data?.pages ?? [], (x) => x.data),
        ],
        (x) => x.id
      ),
      isFetchingNextPage: infinit.isFetchingNextPage,
      hasNextPage: infinit.hasNextPage,
      fetchNextPage: infinit.fetchNextPage,
    }),
    [initial, infinit]
  );
}
