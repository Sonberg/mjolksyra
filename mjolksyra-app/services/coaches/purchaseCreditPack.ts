import { ApiClient } from "../client";

export async function purchaseCreditPack(packId: string): Promise<void> {
  await ApiClient.post("/api/coaches/credits/purchase", { packId });
}
