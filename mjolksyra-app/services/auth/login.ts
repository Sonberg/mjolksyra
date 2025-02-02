import { z } from "zod";
import { ApiClient } from "../client";

type Args = { email: string; password: string };

const schema = z.object({
  isSuccessful: z.boolean(),
  accessToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
  refreshTokenExpiresAt: z.coerce.date().nullable(),
});

export async function login({ email, password }: Args) {
  const { data, status } = await ApiClient.post(`/api/auth/login`, {
    email,
    password,
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
