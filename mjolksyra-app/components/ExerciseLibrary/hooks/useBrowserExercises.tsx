import { GetExercises } from "@/api/exercises/getExercises";
import { flatten } from "@/lib/flatten";
import { uniqBy } from "@/lib/uniqBy";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type Args = {
  exercies: {
    get: GetExercises;
  };
};

export function useBrowseExercises({ exercies }: Args) {
  const initial = useQuery({
    queryKey: ["exercises", "inital"],
    queryFn: async ({ signal }) => await exercies.get({ signal }),
    placeholderData: {
      data: [],
      next: null,
    },
  });

  const infinit = useInfiniteQuery({
    queryKey: ["exercises"],
    queryFn: async ({ pageParam, signal }) => {
      return pageParam
        ? await exercies.get({ cursor: pageParam, signal: signal })
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
