import { ApiClient } from "../client";

type Args = {
  traineeId: string;
};

export type RebuildInsightsResult =
  | { ok: true }
  | { ok: false; status: 402 | 409 | 422 | 403; message: string };

export async function rebuildTraineeInsights({
  traineeId,
}: Args): Promise<RebuildInsightsResult> {
  const response = await ApiClient.post(
    `/api/trainees/${traineeId}/insights/rebuild`,
    null,
    {
      validateStatus: (status) =>
        [202, 402, 403, 409, 422].includes(status),
    }
  );

  if (response.status === 202) {
    return { ok: true };
  }

  return {
    ok: false,
    status: response.status as 402 | 409 | 422 | 403,
    message: response.data?.error ?? "Failed to start rebuild.",
  };
}
