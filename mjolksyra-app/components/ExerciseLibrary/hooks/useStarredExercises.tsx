import { Exercise } from "@/api/exercises/type";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useStarredExercises() {
  const starred = useQuery({
    queryKey: [`exercises/starred`],
    queryFn: async () => {
      return [] as Exercise[];
    },
    placeholderData: [],
  });

  const star = useMutation({
    mutationKey: [`exercises/star`],
    mutationFn: async (exerciseId: string) => {
      return [] as Exercise[];
    },
    onSuccess: () => starred.refetch(),
  });

  const unstar = useMutation({
    mutationKey: [`exercises/unstar`],
    mutationFn: async (exerciseId: string) => {
      return [] as Exercise[];
    },
    onSuccess: () => starred.refetch(),
  });

  return {
    data: starred.data,
    star: star.mutateAsync,
    unstar: unstar.mutateAsync,
  };
}
