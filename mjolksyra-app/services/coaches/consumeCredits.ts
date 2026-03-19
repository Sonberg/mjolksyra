import { z } from "zod";
import { ApiClient } from "../client";

export type CreditAction =
  | "PlanWorkout"
  | "GenerateBlock"
  | "AnalyzeWorkoutText"
  | "AnalyzeWorkoutMedia";

const consumeResultSchema = z.object({
  remainingIncluded: z.number(),
  remainingPurchased: z.number(),
});

export type ConsumeCreditsResult = z.infer<typeof consumeResultSchema>;

export async function consumeCredits(
  action: CreditAction,
  referenceId?: string,
): Promise<ConsumeCreditsResult> {
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
