import { SearchExercises } from "@/services/exercises/searchExercises";
import { Exercise } from "@/services/exercises/type";
import { useQuery } from "@tanstack/react-query";

type Args = {
  freeText: string;
  exercises: {
    search: SearchExercises;
  };
};

export function useSearchExercises({ freeText, exercises }: Args) {
  return useQuery({
    queryKey: [`exercises`, "search", freeText],
    queryFn: async ({ signal }) => {
      return await exercises.search({ freeText, signal });
    },
    placeholderData: {
      data: [] as Exercise[],
      next: null,
    },
  });
}
