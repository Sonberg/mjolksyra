import { ApiClient } from "../client";
import type { LatestPlannerSessionResponse } from "./types";

type Args = {
  traineeId: string;
  signal?: AbortSignal;
};

export async function getLatestPlannerSession({
  traineeId,
  signal,
}: Args): Promise<LatestPlannerSessionResponse | null> {
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
