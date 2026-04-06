import { ApiClient } from "../client";
import type {
  PlannerConversationMessage,
  PlannerFileContent,
  ClarifyWorkoutPlanSuggestedParams,
  GenerateWorkoutPlanResponse,
} from "./types";

type Args = {
  traineeId: string;
  sessionId?: string | null;
  description: string;
  filesContent: PlannerFileContent[];
  conversationHistory: PlannerConversationMessage[];
  params: ClarifyWorkoutPlanSuggestedParams;
  signal?: AbortSignal;
};

export async function generateWorkoutPlan({
  traineeId,
  sessionId,
  description,
  filesContent,
  conversationHistory,
  params,
  signal,
}: Args): Promise<GenerateWorkoutPlanResponse> {
  const response = await ApiClient.post(
    `/api/trainees/${traineeId}/ai-planner/generate`,
    { sessionId, description, filesContent, conversationHistory, params },
    { signal },
  );
  return response.data;
}
