import { StarExercise } from "@/api/exercises/starExercise";
import { StarredExercises } from "@/api/exercises/starredExercises";
import { useMutation, useQuery } from "@tanstack/react-query";

type Args = {
  mutationOnly: boolean;
  exercises: {
    starred: StarredExercises;
    star: StarExercise;
  };
};

export function useStarredExercises({ mutationOnly, exercises }: Args) {
  const starred = useQuery({
    queryKey: [`exercises`, "starred"],
    queryFn: async () => {
      return await exercises.starred();
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
      await exercises.star({ exerciseId, state: true });
    },
    onSuccess: () => starred.refetch(),
  });

  const unstar = useMutation({
    mutationKey: [`exercises`],
    mutationFn: async (exerciseId: string) => {
      await exercises.star({ exerciseId, state: false });
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
