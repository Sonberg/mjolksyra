import { flatten } from "@/lib/flatten";
import { uniqBy } from "@/lib/uniqBy";
import { getPlannedWorkouts } from "@/services/plannedWorkouts/getPlannedWorkout";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type Args = Parameters<typeof getPlannedWorkouts>[0];

export function usePlannedWorkouts({ traineeId, ...args }: Args) {
  const initial = useQuery({
    queryKey: ["plannedWorkouts", traineeId, "inital"],
    queryFn: async ({ signal }) =>
      await getPlannedWorkouts({ ...args, traineeId, signal }),
    placeholderData: {
      data: [],
      next: null,
    },
  });

  const infinit = useInfiniteQuery({
    queryKey: ["plannedWorkouts", traineeId],
    queryFn: async ({ pageParam, signal }) => {
      return pageParam
        ? await getPlannedWorkouts({
            traineeId,
            next: pageParam,
            signal: signal,
          })
        : { data: [], next: null };
    },
    getNextPageParam: (lastPage) => lastPage.next,
    initialPageParam: initial.data?.next,
    enabled: !!initial.data?.next,
  });

  const data = useMemo(
    () =>
      uniqBy(
        [
          ...(initial.data?.data ?? []),
          ...flatten(infinit.data?.pages ?? [], (x) => x.data),
        ],
        (x) => x.id
      ),
    []
  );

  return {
    data,
    next: async () => {
      await infinit.fetchNextPage();
    },
    hasNextPage: infinit.hasNextPage,
  };
}
