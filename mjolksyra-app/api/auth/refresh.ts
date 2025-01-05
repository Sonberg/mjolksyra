import { z } from "zod";
import { ApiClient } from "../client";

type Args = { refreshToken: string };

const schema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  refreshTokenExpiresAt: z.coerce.date(),
});

export async function refresh({ refreshToken }: Args) {
  const { data, status } = await ApiClient.post(`/api/auth/refresh`, {
    refreshToken,
  });

  if (status !== 200) {
    return null;
  }

  const result = await schema.safeParseAsync(data);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}
