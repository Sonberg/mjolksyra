import { z } from "zod";
import { ApiClient } from "../client";

type Args = {
  givenName: string;
  familyName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const schema = z.object({
  isSuccessful: z.boolean(),
  error: z.string().nullable(),
  accessToken: z.string(),
  refreshToken: z.string(),
  refreshTokenExpiresAt: z.coerce.date(),
});

export async function register(body: Args) {
  const { data, status } = await ApiClient.post(`${process.env.API_URL}/api/auth/register`, body);

  if (status !== 200) {
    return null;
  }

  const result = await schema.safeParseAsync(data);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}
