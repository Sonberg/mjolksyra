import { ApiClient } from "../client";
import { workoutMediaAnalysisSchema } from "./schema";

type Args = {
  traineeId: string;
  completedWorkoutId: string;
  analysis: {
    text: string;
  };
};

export async function analyzeCompletedWorkoutMedia({
  traineeId,
  completedWorkoutId,
  analysis,
}: Args) {
  const response = await ApiClient.post(
    `/api/trainees/${traineeId}/workouts/${completedWorkoutId}/analysis`,
    analysis,
  );

  const parsed = await workoutMediaAnalysisSchema.safeParseAsync(response.data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
