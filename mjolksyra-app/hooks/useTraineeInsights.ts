"use client";

import { useQuery } from "@tanstack/react-query";
import { getTraineeInsights } from "@/services/trainees/getTraineeInsights";

export function useTraineeInsights(traineeId: string) {
  return useQuery({
    queryKey: ["trainee-insights", traineeId],
    queryFn: ({ signal }) => getTraineeInsights({ traineeId, signal }),
    initialData: null,
    refetchInterval: (query) => {
      return query.state.data?.status === "pending" ? 10_000 : false;
    },
  });
}
