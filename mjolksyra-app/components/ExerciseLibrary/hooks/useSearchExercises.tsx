import { SearchExercises } from "@/api/exercises/searchExercises";
import { Exercise } from "@/api/exercises/type";
import { useQuery } from "@tanstack/react-query";

type Args = {
  freeText: string;
  exercies: {
    search: SearchExercises;
  };
};

export function useSearchExercises({ freeText, exercies }: Args) {
  return useQuery({
    queryKey: [`exercises`, "search", freeText],
    queryFn: async ({ signal }) => {
      return await exercies.search({ freeText, signal });
    },
    placeholderData: {
      data: [] as Exercise[],
      next: null,
    },
  });
}
