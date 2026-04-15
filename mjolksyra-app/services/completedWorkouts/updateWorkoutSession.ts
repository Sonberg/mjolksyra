import { ApiClient } from "../client";
import { completedWorkoutSchema } from "./schema";
import { CompletedExercise } from "./type";

type Args = {
  traineeId: string;
  id: string;
  session: {
    exercises: CompletedExercise[];
    completedAt?: Date | null;
    mediaUrls?: string[];
  };
};

export async function updateWorkoutSession({ traineeId, id, session }: Args) {
  const url = `/api/trainees/${traineeId}/workouts/${id}`;
  const response = await ApiClient.put(url, session);
  const parsed = await completedWorkoutSchema.safeParseAsync(response.data);
  if (!parsed.success) throw new Error("Failed to parse data");
  return parsed.data;
}
