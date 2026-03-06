import { z } from "zod";
import { ApiClient } from "../client";

const stripeCouponSchema = z.object({
  id: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  percentOff: z.number().nullable().optional(),
  amountOff: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  durationInMonths: z.number().nullable().optional(),
  valid: z.boolean().nullable().optional(),
});

const appliedDiscountCodeSchema = z.object({
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  stripeCouponId: z.string().nullable().optional(),
  stripePromotionCodeId: z.string().nullable().optional(),
  stripeCoupon: stripeCouponSchema.nullable().optional(),
});

export type AppliedDiscountCode = z.infer<typeof appliedDiscountCodeSchema>;

export async function getAppliedDiscountCode() {
  const response = await ApiClient.get("/api/coaches/discout-code");
  const parsed = await appliedDiscountCodeSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
