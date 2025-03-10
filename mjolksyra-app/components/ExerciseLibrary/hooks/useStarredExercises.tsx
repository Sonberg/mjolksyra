import { useMutation, useQuery } from "@tanstack/react-query";
import { useExerciseProvider } from "../ExerciseProvider";

type Args = {
  mutationOnly: boolean;
};

export function useStarredExercises({ mutationOnly }: Args) {
  const exercises = useExerciseProvider();
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
      await exercises.star({
        exerciseId,
        starExerciseRequest: { state: true },
      });
    },
    onSuccess: () => starred.refetch(),
  });

  const unstar = useMutation({
    mutationKey: [`exercises`],
    mutationFn: async (exerciseId: string) => {
      await exercises.star({
        exerciseId,
        starExerciseRequest: { state: false },
      });
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
