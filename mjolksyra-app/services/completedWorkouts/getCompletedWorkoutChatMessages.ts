import { ApiClient } from "../client";
import { workoutChatMessageSchema } from "./schema";
import { z } from "zod";

type Args = {
  traineeId: string;
  completedWorkoutId: string;
  signal?: AbortSignal;
};

export async function getCompletedWorkoutChatMessages({
  traineeId,
  completedWorkoutId,
  signal,
}: Args) {
  const response = await ApiClient.get(
    `/api/trainees/${traineeId}/workouts/${completedWorkoutId}/chat-messages`,
    { signal },
  );

  const parsed = await z.array(workoutChatMessageSchema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
