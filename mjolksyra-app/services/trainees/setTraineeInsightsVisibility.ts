import { ApiClient } from "../client";

type Args = {
  traineeId: string;
  visibleToAthlete: boolean;
};

export async function setTraineeInsightsVisibility({
  traineeId,
  visibleToAthlete,
}: Args): Promise<void> {
  await ApiClient.patch(`/api/trainees/${traineeId}/insights/visibility`, {
    visibleToAthlete,
  });
}
