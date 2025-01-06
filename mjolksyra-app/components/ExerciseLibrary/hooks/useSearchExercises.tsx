import { searchExercises } from "@/api/exercises/searchExercises";
import { Exercise } from "@/api/exercises/type";
import { useQuery } from "@tanstack/react-query";

type Args = {
  freeText: string;
};

export function useSearchExercises({ freeText }: Args) {
  return useQuery({
    queryKey: [`exercises/search/${freeText}`],
    queryFn: async ({ signal }) => {
      return await searchExercises({ freeText, signal });
    },
    placeholderData: {
      data: [] as Exercise[],
      next: null,
    },
  });
}
