import { getPlannedWorkouts } from "@/api/plannedWorkouts/getPlannedWorkout";
import { flatten } from "@/lib/flatten";
import { uniqBy } from "@/lib/uniqBy";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";

type Args = {
  traineeId: string;
  fromDate?: dayjs.Dayjs;
  toDate?: dayjs.Dayjs;
};

export function useWorkouts({ traineeId, fromDate, toDate }: Args) {
  const initial = useQuery({
    queryKey: ["planned-workouts", "inital"],
    queryFn: async ({ signal }) =>
      await getPlannedWorkouts({
        traineeId,
        signal,
        fromDate,
        toDate,
        limit: 30,
      }),
    placeholderData: {
      data: [],
      next: null,
    },
  });

  const infinit = useInfiniteQuery({
    queryKey: ["planned-workouts", "infinit"],
    queryFn: async ({ pageParam, signal }) => {
      return pageParam
        ? await getPlannedWorkouts({ traineeId, next: pageParam, signal })
        : { data: [], next: null };
    },
    getNextPageParam: (lastPage) => lastPage.next,
    initialPageParam: initial.data?.next,
    enabled: !!initial.data?.next,
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
