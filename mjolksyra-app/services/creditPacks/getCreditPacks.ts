import { z } from "zod";
import { ApiClient } from "../client";

const creditPackSchema = z.object({
  id: z.string(),
  name: z.string(),
  credits: z.number(),
  priceSek: z.number(),
});

export type CreditPack = z.infer<typeof creditPackSchema>;

export async function getCreditPacks(): Promise<CreditPack[]> {
  const response = await ApiClient.get("/api/credit-packs");
  const parsed = await z.array(creditPackSchema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
