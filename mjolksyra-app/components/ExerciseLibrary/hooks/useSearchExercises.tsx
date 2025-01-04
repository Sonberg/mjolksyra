import { searchExercises } from "@/api/exercises/searchExercises";
import { useQuery } from "@tanstack/react-query";

type Args = {
  freeText: string;
};

export function useSearchExercises({ freeText }: Args) {
  return useQuery({
    queryKey: [`exercises/search/${freeText}`],
    queryFn: async () => {
      return await searchExercises({ freeText });
    },
    placeholderData: [],
  });
}
