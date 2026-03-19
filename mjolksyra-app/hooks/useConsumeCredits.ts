import { consumeCredits, type CreditAction } from "@/services/coaches/consumeCredits";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useConsumeCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, referenceId }: { action: CreditAction; referenceId?: string }) =>
      consumeCredits(action, referenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-ai-credits"] });
    },
  });
}
