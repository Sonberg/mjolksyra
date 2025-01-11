import { getPlannedWorkouts } from "@/api/plannedWorkouts/getPlannedWorkout";
import { flatten } from "@/lib/flatten";
import { uniqBy } from "@/lib/uniqBy";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type Args = {
  traineeId: string;
};

export function useWorkouts({ traineeId }: Args) {
  const initial = useQuery({
    queryKey: ["planned-workouts", "inital"],
    queryFn: async ({ signal }) =>
      await getPlannedWorkouts({ traineeId, signal, limit: 30 }),
    placeholderData: {
      data: [],
      next: null,
    },
  });

  const infinit = useInfiniteQuery({
    queryKey: ["planned-workouts"],
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
      isFetched: initial.isFetched,
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
    [infinit, initial]
  );
}
