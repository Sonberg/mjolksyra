import { ApiClient } from "../client";
import type {
  AIPlannerConversationMessage,
  AIPlannerFileContent,
  ClarifyWorkoutPlanResponse,
} from "./types";

type Args = {
  traineeId: string;
  description: string;
  filesContent: AIPlannerFileContent[];
  conversationHistory: AIPlannerConversationMessage[];
  signal?: AbortSignal;
};

export async function clarifyWorkoutPlan({
  traineeId,
  description,
  filesContent,
  conversationHistory,
  signal,
}: Args): Promise<ClarifyWorkoutPlanResponse> {
  const response = await ApiClient.post(
    `/api/trainees/${traineeId}/ai-planner/clarify`,
    { description, filesContent, conversationHistory },
    { signal },
  );
  return response.data;
}
