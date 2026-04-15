"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rebuildTraineeInsights } from "@/services/trainees/rebuildTraineeInsights";

export function useRebuildTraineeInsights(traineeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => rebuildTraineeInsights({ traineeId }),
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({
          queryKey: ["trainee-insights", traineeId],
        });
      }
    },
  });
}
