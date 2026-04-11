import { ApiClient } from "../client";
import { workoutChatMessageSchema } from "./schema";

type Args = {
  traineeId: string;
  completedWorkoutId: string;
  chatMessageId: string;
  message: string;
};

export async function updateCompletedWorkoutChatMessage({
  traineeId,
  completedWorkoutId,
  chatMessageId,
  message,
}: Args) {
  const response = await ApiClient.patch(
    `/api/trainees/${traineeId}/workouts/${completedWorkoutId}/chat-messages/${chatMessageId}`,
    { message },
  );

  const parsed = await workoutChatMessageSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
