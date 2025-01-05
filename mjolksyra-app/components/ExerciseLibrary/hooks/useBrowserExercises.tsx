import { getExercises } from "@/api/exercises/getExercises";
import { flatten } from "@/lib/flatten";
import { uniqBy } from "@/lib/uniqBy";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useBrowseExercises() {
  const initial = useQuery({
    queryKey: ["exercises/inital"],
    queryFn: async () => await getExercises({}),
    placeholderData: {
      data: [],
      next: null,
    },
  });

  const infinit = useInfiniteQuery({
    queryKey: ["exercises"],
    queryFn: async (arg) => {
      return arg.pageParam
        ? await getExercises({ cursor: arg.pageParam })
        : { data: [], next: null };
    },
    getNextPageParam: (lastPage, _) => lastPage.next,
    initialPageParam: initial.data?.next,
    enabled: !!initial.data?.next,
  });

  return useMemo(
    () => ({
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
