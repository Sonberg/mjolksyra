import { ApiClient } from "../client";
import type {
  PlannerConversationMessage,
  PlannerFileContent,
  ClarifyWorkoutPlanResponse,
} from "./types";

type Args = {
  traineeId: string;
  sessionId?: string | null;
  description: string;
  filesContent: PlannerFileContent[];
  conversationHistory: PlannerConversationMessage[];
  signal?: AbortSignal;
};

export async function clarifyWorkoutPlan({
  traineeId,
  sessionId,
  description,
  filesContent,
  conversationHistory,
  signal,
}: Args): Promise<ClarifyWorkoutPlanResponse> {
  const response = await ApiClient.post(
    `/api/trainees/${traineeId}/ai-planner/clarify`,
    { sessionId, description, filesContent, conversationHistory },
    { signal },
  );
  return response.data;
}
