import { searchExercises } from "@/api/exercises/searchExercises";
import { Exercise } from "@/api/exercises/type";
import { useQuery } from "@tanstack/react-query";
import next from "next";

type Args = {
  freeText: string;
};

export function useSearchExercises({ freeText }: Args) {
  return useQuery({
    queryKey: [`exercises/search/${freeText}`],
    queryFn: async () => {
      return await searchExercises({ freeText });
    },
    placeholderData: {
      data: [] as Exercise[],
      next: null,
    },
  });
}
