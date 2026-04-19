import { ApiClient } from "../client";
import type { LatestBlockPlannerSessionResponse } from "./types";

type Args = {
  blockId: string;
  signal?: AbortSignal;
};

export async function getLatestBlockPlannerSession({
  blockId,
  signal,
}: Args): Promise<LatestBlockPlannerSessionResponse | null> {
  try {
    const response = await ApiClient.get(
      `/api/blocks/${blockId}/planner/session/latest`,
      { signal },
    );
    return response.data;
  } catch {
    return null;
  }
}
