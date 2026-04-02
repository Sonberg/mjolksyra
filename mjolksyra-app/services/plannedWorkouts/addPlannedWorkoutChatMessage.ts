import { ApiClient } from "../client";
import { workoutChatMessageSchema } from "./schema";

type Args = {
  traineeId: string;
  plannedWorkoutId: string;
  message: {
    message: string;
    mediaUrls: string[];
  };
};

export async function addPlannedWorkoutChatMessage({
  traineeId,
  plannedWorkoutId,
  message,
}: Args) {
  const response = await ApiClient.post(
    `/api/trainees/${traineeId}/planned-workouts/${plannedWorkoutId}/chat-messages`,
    message,
  );

  const parsed = await workoutChatMessageSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
