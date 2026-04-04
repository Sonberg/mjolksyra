import { z } from "zod";
import { ApiClient } from "../client";

const creditLedgerItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  action: z.string().nullable().optional(),
  includedCreditsChanged: z.number(),
  purchasedCreditsChanged: z.number(),
  referenceId: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type CreditLedgerItem = z.infer<typeof creditLedgerItemSchema>;

export async function getCreditLedger(args?: { limit?: number; before?: string }): Promise<CreditLedgerItem[]> {
  const params = new URLSearchParams();
  if (args?.limit) {
    params.set("limit", args.limit.toString());
  }
  if (args?.before) {
    params.set("before", args.before);
  }

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const response = await ApiClient.get(`/api/coaches/credits/ledger${suffix}`);
  const parsed = await z.array(creditLedgerItemSchema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
