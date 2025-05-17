import { ApiClient } from "../client";
import { schema } from "./schema";

type Args = {
  email: string;
  signal?: AbortSignal;
};

export async function inviteTrainee({ email, signal }: Args) {
  const response = await ApiClient.post(
    `/api/trainee-invitations`,
    {
      email,
    },
    {
      signal,
    }
  );
  const parsed = await schema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error("Failed to parse data");
  }

  return parsed.data!;
}
