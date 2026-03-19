import { z } from "zod";
import { ApiClient } from "../client";

const analyzeWorkoutTextResultSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  recommendations: z.array(z.string()),
  remainingIncluded: z.number(),
  remainingPurchased: z.number(),
});

export type AnalyzeWorkoutTextResult = z.infer<
  typeof analyzeWorkoutTextResultSchema
>;

export async function analyzeWorkoutText(
  plannedWorkout: unknown,
  referenceId?: string,
): Promise<AnalyzeWorkoutTextResult> {
  const response = await ApiClient.post("/api/coaches/ai/analyze-workout-text", {
    plannedWorkout,
    referenceId,
  });
  const parsed = await analyzeWorkoutTextResultSchema.safeParseAsync(
    response.data,
  );

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
