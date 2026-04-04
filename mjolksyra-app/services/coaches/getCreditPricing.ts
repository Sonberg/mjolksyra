import { z } from "zod";
import { ApiClient } from "../client";

const creditPricingItemSchema = z.object({
  action: z.string(),
  creditCost: z.number(),
});

export type CreditPricingItem = z.infer<typeof creditPricingItemSchema>;

export async function getCreditPricing(): Promise<CreditPricingItem[]> {
  const response = await ApiClient.get("/api/coaches/credits/pricing");
  const parsed = await z.array(creditPricingItemSchema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
