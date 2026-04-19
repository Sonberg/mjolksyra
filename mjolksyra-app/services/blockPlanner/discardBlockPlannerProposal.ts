import { ApiClient } from "../client";

type Args = {
  blockId: string;
  proposalId: string;
  signal?: AbortSignal;
};

export async function discardBlockPlannerProposal({
  blockId,
  proposalId,
  signal,
}: Args): Promise<void> {
  await ApiClient.post(
    `/api/blocks/${blockId}/planner/proposals/${proposalId}/discard`,
    undefined,
    { signal },
  );
}
