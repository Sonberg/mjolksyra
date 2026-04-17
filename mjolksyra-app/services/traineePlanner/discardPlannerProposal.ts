import { ApiClient } from "../client";

type Args = {
  traineeId: string;
  proposalId: string;
  signal?: AbortSignal;
};

export async function discardPlannerProposal({
  traineeId,
  proposalId,
  signal,
}: Args) {
  await ApiClient.post(
    `/api/trainees/${traineeId}/ai-planner/proposals/${proposalId}/discard`,
    undefined,
    { signal },
  );
}
