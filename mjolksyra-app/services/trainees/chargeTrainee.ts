import { ApiClient } from "../client";

export async function chargeTrainee({ traineeId }: { traineeId: string }) {
  await ApiClient.post(`/api/trainees/${traineeId}/charge`);
}
