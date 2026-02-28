import { ApiClient } from "../client";
import { adminStatsSchema, type AdminStats } from "./schema";

type Args = {
  accessToken: string;
};

export async function getAdminStats({ accessToken }: Args): Promise<AdminStats> {
  const response = await ApiClient.get(`${process.env.API_URL}/api/admin/stats`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const parsed = await adminStatsSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
