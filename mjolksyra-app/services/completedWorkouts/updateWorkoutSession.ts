import { ApiClient } from "../client";
import { completedWorkoutSchema } from "./schema";
import { CompletedExercise } from "./type";

type Args = {
  traineeId: string;
  plannedWorkoutId: string;
  session: {
    exercises: CompletedExercise[];
    completedAt?: Date | null;
    reviewedAt?: Date | null;
    mediaUrls?: string[];
  };
};

export async function updateWorkoutSession({ traineeId, plannedWorkoutId, session }: Args) {
  const url = `/api/trainees/${traineeId}/planned-workouts/${plannedWorkoutId}/session`;
  const response = await ApiClient.put(url, session);
  const parsed = await completedWorkoutSchema.safeParseAsync(response.data);
  if (!parsed.success) throw new Error("Failed to parse data");
  return parsed.data;
}
