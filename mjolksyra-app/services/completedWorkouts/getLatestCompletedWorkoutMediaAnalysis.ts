import { AxiosError } from "axios";
import { ApiClient } from "../client";
import { workoutMediaAnalysisSchema } from "./schema";

type Args = {
  traineeId: string;
  completedWorkoutId: string;
  signal?: AbortSignal;
};

export async function getLatestCompletedWorkoutMediaAnalysis({
  traineeId,
  completedWorkoutId,
  signal,
}: Args) {
  try {
    const response = await ApiClient.get(
      `/api/trainees/${traineeId}/workouts/${completedWorkoutId}/analysis/latest`,
      { signal },
    );

    const parsed = await workoutMediaAnalysisSchema.safeParseAsync(response.data);
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}
