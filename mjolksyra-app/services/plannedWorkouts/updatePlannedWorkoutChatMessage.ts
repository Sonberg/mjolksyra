import { ApiClient } from "../client";
import { workoutChatMessageSchema } from "./schema";

type Args = {
  traineeId: string;
  plannedWorkoutId: string;
  chatMessageId: string;
  message: string;
};

export async function updatePlannedWorkoutChatMessage({
  traineeId,
  plannedWorkoutId,
  chatMessageId,
  message,
}: Args) {
  const response = await ApiClient.patch(
    `/api/trainees/${traineeId}/planned-workouts/${plannedWorkoutId}/chat-messages/${chatMessageId}`,
    { message },
  );

  const parsed = await workoutChatMessageSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
