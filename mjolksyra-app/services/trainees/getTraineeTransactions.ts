import { ApiClient } from "@/services/client";
import { schema } from "./schema";

const transactionsSchema = schema.shape.transactions.removeDefault().unwrap();

export async function getTraineeTransactions({
  traineeId,
}: {
  traineeId: string;
}) {
  const res = await ApiClient.get(`/api/trainees/${traineeId}/transactions`);
  return transactionsSchema.parse(res.data);
}
