import { ApiClient } from "../client";
import type {
  AIPlannerConversationMessage,
  AIPlannerFileContent,
  ClarifyWorkoutPlanSuggestedParams,
  GenerateWorkoutPlanResponse,
} from "./types";

type Args = {
  traineeId: string;
  description: string;
  filesContent: AIPlannerFileContent[];
  conversationHistory: AIPlannerConversationMessage[];
  params: ClarifyWorkoutPlanSuggestedParams;
  signal?: AbortSignal;
};

export async function generateWorkoutPlan({
  traineeId,
  description,
  filesContent,
  conversationHistory,
  params,
  signal,
}: Args): Promise<GenerateWorkoutPlanResponse> {
  const response = await ApiClient.post(
    `/api/trainees/${traineeId}/ai-planner/generate`,
    { description, filesContent, conversationHistory, params },
    { signal },
  );
  return response.data;
}
