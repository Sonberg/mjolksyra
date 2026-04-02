import { ApiClient } from "../client";
import { workoutChatMessageSchema } from "./schema";
import { z } from "zod";

type Args = {
  traineeId: string;
  plannedWorkoutId: string;
  signal?: AbortSignal;
};

export async function getPlannedWorkoutChatMessages({
  traineeId,
  plannedWorkoutId,
  signal,
}: Args) {
  const response = await ApiClient.get(
    `/api/trainees/${traineeId}/planned-workouts/${plannedWorkoutId}/chat-messages`,
    { signal },
  );

  const parsed = await z.array(workoutChatMessageSchema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
