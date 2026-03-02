import { ApiClient } from "../client";
import { coachRevenueListSchema, type CoachRevenueItem } from "./schema";

type Args = {
  accessToken: string;
};

export async function getCoachRevenue({ accessToken }: Args): Promise<CoachRevenueItem[]> {
  const response = await ApiClient.get(`${process.env.API_URL}/api/admin/coaches/revenue`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const parsed = await coachRevenueListSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
