import { ApiClient } from "../client";

type Args = {
  blockId: string;
  sessionId: string;
  signal?: AbortSignal;
};

export async function deleteBlockPlannerSession({
  blockId,
  sessionId,
  signal,
}: Args): Promise<void> {
  await ApiClient.delete(
    `/api/blocks/${blockId}/planner/session/${sessionId}`,
    { signal },
  );
}
