import { ApiClient } from "../client";
import { blockSchema } from "./schema";
import { Block } from "./type";

type Args = {
  blockId: string;
  block: Pick<Block, "name" | "numberOfWeeks" | "workouts">;
};

export type UpdateBlock = typeof updateBlock;

export async function updateBlock({ blockId, block }: Args) {
  const response = await ApiClient.put(`/api/blocks/${blockId}`, block);
  const parsed = await blockSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
