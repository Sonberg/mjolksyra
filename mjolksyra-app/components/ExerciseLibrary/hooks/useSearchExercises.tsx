import { useQuery } from "@tanstack/react-query";
import { useExerciseProvider } from "../ExerciseProvider";

type Args = {
  freeText: string;
};

export function useSearchExercises({ freeText }: Args) {
  const exercises = useExerciseProvider();
  return useQuery({
    queryKey: [`exercises`, "search", freeText],
    queryFn: async ({ signal }) => {
      return await exercises.search(
        {
          searchExercisesRequest: { freeText },
        },
        { signal }
      );
    },
    placeholderData: {
      data: [],
      next: null,
    },
  });
}
