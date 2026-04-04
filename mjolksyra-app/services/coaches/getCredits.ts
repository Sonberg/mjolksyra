import { z } from "zod";
import { ApiClient } from "../client";

const creditsSchema = z.object({
  includedRemaining: z.number(),
  purchasedRemaining: z.number(),
  totalRemaining: z.number(),
  lastResetAt: z.string().nullable().optional(),
  nextResetAt: z.string().nullable().optional(),
});

export type Credits = z.infer<typeof creditsSchema>;

export async function getCredits(): Promise<Credits> {
  const response = await ApiClient.get("/api/coaches/credits");
  const parsed = await creditsSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
