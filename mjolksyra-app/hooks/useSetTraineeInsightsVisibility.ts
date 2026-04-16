"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setTraineeInsightsVisibility } from "@/services/trainees/setTraineeInsightsVisibility";

export function useSetTraineeInsightsVisibility(traineeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visibleToAthlete: boolean) =>
      setTraineeInsightsVisibility({ traineeId, visibleToAthlete }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["trainee-insights", traineeId],
      });
    },
  });
}
