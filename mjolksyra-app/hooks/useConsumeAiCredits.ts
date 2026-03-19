import { consumeAiCredits, type AiCreditAction } from "@/services/coaches/consumeAiCredits";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useConsumeAiCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, referenceId }: { action: AiCreditAction; referenceId?: string }) =>
      consumeAiCredits(action, referenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-ai-credits"] });
    },
  });
}
