import { ApiClient } from "../client";
import type {
  PlannerConversationMessage,
  PlannerFileContent,
  ClarifyWorkoutPlanSuggestedParams,
  PreviewWorkoutPlanResponse,
} from "./types";

type Args = {
  traineeId: string;
  description: string;
  filesContent: PlannerFileContent[];
  conversationHistory: PlannerConversationMessage[];
  params: ClarifyWorkoutPlanSuggestedParams;
  signal?: AbortSignal;
};

export async function previewWorkoutPlan({
  traineeId,
  description,
  filesContent,
  conversationHistory,
  params,
  signal,
}: Args): Promise<PreviewWorkoutPlanResponse> {
  const response = await ApiClient.post(
    `/api/trainees/${traineeId}/ai-planner/preview`,
    { description, filesContent, conversationHistory, params },
    { signal },
  );
  return response.data;
}
