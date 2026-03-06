import { ApiClient } from "../client";
import { createDiscountCodeResultSchema, type CreateDiscountCodeResult } from "./schema";

export type DiscountType = "Percent" | "FixedAmount";
export type DiscountDuration = "Forever" | "Once" | "Repeating";

type Args = {
  accessToken: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  duration: DiscountDuration;
  durationInMonths?: number;
  maxRedemptions?: number;
};

export async function createDiscountCode({
  accessToken,
  code,
  description,
  discountType,
  discountValue,
  duration,
  durationInMonths,
  maxRedemptions,
}: Args): Promise<CreateDiscountCodeResult> {
  const response = await ApiClient.post(
    `${process.env.API_URL}/api/admin/discount-codes`,
    { code, description, discountType, discountValue, duration, durationInMonths, maxRedemptions },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const parsed = await createDiscountCodeResultSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
