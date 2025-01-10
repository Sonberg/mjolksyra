import { starExercises } from "@/api/exercises/starExercise";
import { starredExercises } from "@/api/exercises/starredExercises";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useStarredExercises(mutationOnly?: boolean) {
  const starred = useQuery({
    queryKey: [`exercises`, "starred"],
    queryFn: async () => {
      return await starredExercises();
    },
    placeholderData: {
      data: [],
      next: null,
    },
    enabled: !mutationOnly,
  });

  const star = useMutation({
    mutationKey: [`exercises`],
    mutationFn: async (exerciseId: string) => {
      await starExercises({ exerciseId, state: true });
    },
    onSuccess: () => starred.refetch(),
  });

  const unstar = useMutation({
    mutationKey: [`exercises`],
    mutationFn: async (exerciseId: string) => {
      await starExercises({ exerciseId, state: false });
    },
    onSuccess: () => starred.refetch(),
  });

  return {
    isFetched: starred.isFetched,
    data: starred.data?.data,
    star: star.mutateAsync,
    unstar: unstar.mutateAsync,
  };
}
