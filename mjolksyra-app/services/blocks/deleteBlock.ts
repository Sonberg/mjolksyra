import { ApiClient } from "../client";

export type DeleteBlock = typeof deleteBlock;

export async function deleteBlock({ blockId }: { blockId: string }) {
  await ApiClient.delete(`/api/blocks/${blockId}`);
}
