import { ApiClient } from "../client";
import { traineeInsightsSchema, type TraineeInsights } from "./traineeInsightsSchema";

type Args = {
  traineeId: string;
  signal?: AbortSignal;
};

export async function getTraineeInsights({
  traineeId,
  signal,
}: Args): Promise<TraineeInsights | null> {
  const response = await ApiClient.get(`/api/trainees/${traineeId}/insights`, {
    signal,
    validateStatus: (status) => status === 200 || status === 404,
  });

  if (response.status === 404 || !response.data) {
    return null;
  }

  const parsed = await traineeInsightsSchema.safeParseAsync(response.data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
