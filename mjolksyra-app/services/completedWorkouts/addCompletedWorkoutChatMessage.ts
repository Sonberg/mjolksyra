import { ApiClient } from "../client";
import { workoutChatMessageSchema } from "./schema";

type Args = {
  traineeId: string;
  completedWorkoutId: string;
  message: {
    message: string;
    mediaUrls: string[];
    role?: "Athlete" | "Coach";
  };
};

export async function addCompletedWorkoutChatMessage({
  traineeId,
  completedWorkoutId,
  message,
}: Args) {
  const response = await ApiClient.post(
    `/api/trainees/${traineeId}/workouts/${completedWorkoutId}/chat-messages`,
    message,
  );

  const parsed = await workoutChatMessageSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
