import { ApiClient } from "../client";

export async function declineTraineeInvitation({ id }: { id: string }) {
  await ApiClient.put(`/api/trainee-invitations/${id}/decline`);
}
