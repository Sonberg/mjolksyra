import { ApiClient } from "../client";

export async function purchaseAiCreditPack(packId: string): Promise<void> {
  await ApiClient.post("/api/coaches/ai-credits/purchase", { packId });
}
