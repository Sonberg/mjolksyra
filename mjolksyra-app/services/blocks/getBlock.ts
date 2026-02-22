import { ApiClient } from "../client";
import { blockSchema } from "./schema";

export type GetBlock = typeof getBlock;

export async function getBlock({ blockId }: { blockId: string }) {
  const response = await ApiClient.get(`/api/blocks/${blockId}`);
  const parsed = await blockSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
