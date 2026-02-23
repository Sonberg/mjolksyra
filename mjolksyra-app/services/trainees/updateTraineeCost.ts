import { ApiClient } from "../client";

type Args = {
  traineeId: string;
  amount: number;
};

export async function updateTraineeCost({ traineeId, amount }: Args) {
  await ApiClient.put(`/api/trainees/${traineeId}/cost`, {
    amount,
  });
}
