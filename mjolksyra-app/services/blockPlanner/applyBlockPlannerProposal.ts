import { ApiClient } from "../client";
import type { ApplyBlockPlannerProposalResponse } from "./types";

type Args = {
  blockId: string;
  proposalId: string;
  signal?: AbortSignal;
};

export async function applyBlockPlannerProposal({
  blockId,
  proposalId,
  signal,
}: Args): Promise<ApplyBlockPlannerProposalResponse> {
  const response = await ApiClient.post(
    `/api/blocks/${blockId}/planner/proposals/${proposalId}/apply`,
    undefined,
    { signal },
  );
  return response.data;
}
