import { ApiClient } from "../client";
import type { LatestAIPlannerSessionResponse } from "./types";

type Args = {
  traineeId: string;
  signal?: AbortSignal;
};

export async function getLatestAIPlannerSession({
  traineeId,
  signal,
}: Args): Promise<LatestAIPlannerSessionResponse | null> {
  try {
    const response = await ApiClient.get(
      `/api/trainees/${traineeId}/ai-planner/session/latest`,
      { signal },
    );
    return response.data;
  } catch {
    return null;
  }
}
