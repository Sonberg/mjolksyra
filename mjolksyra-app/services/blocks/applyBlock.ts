import { ApiClient } from "../client";

type Args = {
  blockId: string;
  traineeId: string;
  startDate: string; // ISO date string "YYYY-MM-DD"
};

export type ApplyBlock = typeof applyBlock;

export async function applyBlock({ blockId, traineeId, startDate }: Args) {
  await ApiClient.post(`/api/blocks/${blockId}/apply`, {
    traineeId,
    startDate,
  });
}
