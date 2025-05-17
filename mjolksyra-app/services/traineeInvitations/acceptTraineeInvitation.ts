import { ApiClient } from "../client";

export async function acceptTraineeInvitation({ id }: { id: string }) {
  await ApiClient.put(`/api/trainee-invitations/${id}/accept`);
}
