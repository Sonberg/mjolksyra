import { SearchExercises } from "@/services/exercises/searchExercises";
import { Exercise } from "@/services/exercises/type";
import { useQuery } from "@tanstack/react-query";

type Args = {
  freeText: string;
  filters: {
    sport: string | null;
    level: string | null;
    createdByMe: boolean;
  };
  exercises: {
    search: SearchExercises;
  };
};

export function useSearchExercises({ freeText, filters, exercises }: Args) {
  return useQuery({
    queryKey: [`exercises`, "search", freeText, filters],
    queryFn: async ({ signal }) => {
      return await exercises.search({ freeText, filters, signal });
    },
    placeholderData: {
      data: [] as Exercise[],
      next: null,
    },
  });
}
