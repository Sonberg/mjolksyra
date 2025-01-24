import { ApiClient } from "../client";
import { userSchema } from "./schema";

type Args = {
  accessToken: string;
};

export async function getUserMe({ accessToken }: Args) {
  const response = await ApiClient.get(`${process.env.API_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const parsed = await userSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
