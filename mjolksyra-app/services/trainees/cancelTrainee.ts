import { ApiClient } from "@/services/client";

export async function cancelTrainee({ traineeId }: { traineeId: string }) {
  await ApiClient.put(`/api/trainees/${traineeId}/cancel`);
}
