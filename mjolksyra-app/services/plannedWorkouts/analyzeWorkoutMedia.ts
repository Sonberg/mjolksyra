import { ApiClient } from "../client";
import { workoutMediaAnalysisSchema } from "./schema";

type Args = {
  traineeId: string;
  plannedWorkoutId: string;
  analysis: {
    text: string;
    mediaUrls: string[];
  };
};

export async function analyzeWorkoutMedia({
  traineeId,
  plannedWorkoutId,
  analysis,
}: Args) {
  const response = await ApiClient.post(
    `/api/trainees/${traineeId}/planned-workouts/${plannedWorkoutId}/analysis`,
    analysis,
  );

  const parsed = await workoutMediaAnalysisSchema.safeParseAsync(response.data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
