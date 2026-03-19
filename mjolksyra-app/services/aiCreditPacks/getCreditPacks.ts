import { z } from "zod";

const aiCreditPackSchema = z.object({
  id: z.string(),
  name: z.string(),
  credits: z.number(),
  priceSek: z.number(),
});

export type CreditPack = z.infer<typeof aiCreditPackSchema>;

export async function getCreditPacks(): Promise<CreditPack[]> {
  const url =
    typeof window === "undefined"
      ? `${process.env.API_URL}/api/ai-credit-packs`
      : "/api/ai-credit-packs";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch AI credit packs");

  const data = await res.json();
  const parsed = z.array(aiCreditPackSchema).safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data;
}
