import { ApiClient } from "../client";
import type {
  PlannerConversationMessage,
  PlannerFileContent,
  ClarifyBlockPlanResponse,
} from "./types";

type Args = {
  blockId: string;
  sessionId?: string | null;
  description: string;
  filesContent: PlannerFileContent[];
  conversationHistory: PlannerConversationMessage[];
  signal?: AbortSignal;
};

export async function clarifyBlockPlan({
  blockId,
  sessionId,
  description,
  filesContent,
  conversationHistory,
  signal,
}: Args): Promise<ClarifyBlockPlanResponse> {
  const response = await ApiClient.post(
    `/api/blocks/${blockId}/planner/clarify`,
    { sessionId, description, filesContent, conversationHistory },
    { signal },
  );
  return response.data;
}
