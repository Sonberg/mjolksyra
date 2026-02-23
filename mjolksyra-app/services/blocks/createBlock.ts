import { ApiClient } from "../client";
import { blockSchema } from "./schema";
import { Block } from "./type";

type Args = {
  block: Pick<Block, "name" | "numberOfWeeks" | "workouts">;
};

export type CreateBlock = typeof createBlock;

export async function createBlock({ block }: Args) {
  const response = await ApiClient.post("/api/blocks", block);
  const parsed = await blockSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
