import { ApiClient } from "../client";
import { blockSchema } from "./schema";
import { z } from "zod";

export type GetBlocks = typeof getBlocks;

export async function getBlocks() {
  const response = await ApiClient.get("/api/blocks");
  const parsed = await z.array(blockSchema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
