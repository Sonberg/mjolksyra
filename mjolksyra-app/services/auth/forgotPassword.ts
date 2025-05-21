import { ApiClient } from "../client";

type Args = { email: string };

export async function forgotPassword({ email }: Args) {
  await ApiClient.post(`/api/auth/forgot-password`, {
    email,
  });
}
