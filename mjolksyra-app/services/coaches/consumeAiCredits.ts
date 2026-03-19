import { z } from "zod";
import { ApiClient } from "../client";

export type AiCreditAction =
  | "PlanWorkout"
  | "GenerateBlock"
  | "AnalyzeWorkoutText"
  | "AnalyzeWorkoutMedia";

const consumeResultSchema = z.object({
  remainingIncluded: z.number(),
  remainingPurchased: z.number(),
});

export type ConsumeAiCreditsResult = z.infer<typeof consumeResultSchema>;

export async function consumeAiCredits(
  action: AiCreditAction,
  referenceId?: string,
): Promise<ConsumeAiCreditsResult> {
  const response = await ApiClient.post("/api/coaches/ai-credits/consume", {
    action,
    referenceId,
  });
  const parsed = await consumeResultSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
