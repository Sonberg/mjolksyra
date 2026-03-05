import { ApiClient } from "../client";
import { discountCodeListSchema, type DiscountCode } from "./schema";

type Args = {
  accessToken: string;
};

export async function getDiscountCodes({ accessToken }: Args): Promise<DiscountCode[]> {
  const response = await ApiClient.get(`${process.env.API_URL}/api/admin/discount-codes`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const parsed = await discountCodeListSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
