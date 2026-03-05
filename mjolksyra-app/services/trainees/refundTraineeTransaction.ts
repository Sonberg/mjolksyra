import { ApiClient } from "@/services/client";

export async function refundTraineeTransaction({
  traineeId,
  transactionId,
}: {
  traineeId: string;
  transactionId: string;
}) {
  await ApiClient.post(
    `/api/trainees/${traineeId}/transactions/${transactionId}/refund`,
  );
}
