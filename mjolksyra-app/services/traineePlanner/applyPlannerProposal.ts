import { ApiClient } from "../client";
import type { AIPlannerApplyProposalResponse } from "./types";

type Args = {
  traineeId: string;
  proposalId: string;
  signal?: AbortSignal;
};

export async function applyPlannerProposal({
  traineeId,
  proposalId,
  signal,
}: Args): Promise<AIPlannerApplyProposalResponse> {
  const response = await ApiClient.post(
    `/api/trainees/${traineeId}/ai-planner/proposals/${proposalId}/apply`,
    undefined,
    { signal },
  );

  return response.data;
}
