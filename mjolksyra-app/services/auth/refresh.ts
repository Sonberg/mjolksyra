import { z } from "zod";

type Args = { refreshToken: string };

const schema = z.object({
  isSuccessful: z.boolean(),
  accessToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
  refreshTokenExpiresAt: z.coerce.date().nullable(),
});

export async function refresh({ refreshToken }: Args) {
  const response = await fetch(`${process.env.API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken,
    }),
  });

  console.log(response.status);

  if (response.status !== 200) {
    return null;
  }

  const data = await response.json();
  const result = await schema.safeParseAsync(data);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}
