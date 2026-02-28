import { ApiClient } from "../client";

type Args = {
  traineeId: string;
  amount: number;
  billingMode?: "ChargeNow" | "NextCycle";
};

export async function updateTraineeCost({
  traineeId,
  amount,
  billingMode = "ChargeNow",
}: Args) {
  await ApiClient.put(`/api/trainees/${traineeId}/cost`, {
    amount,
    billingMode,
  });
}
