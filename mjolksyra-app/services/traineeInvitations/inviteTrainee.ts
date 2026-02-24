import { ApiClient } from "../client";
import { schema } from "./schema";

type Args = {
  email: string;
  monthlyPriceAmount: number;
  signal?: AbortSignal;
};

export async function inviteTrainee({ email, monthlyPriceAmount, signal }: Args) {
  const response = await ApiClient.post(
    `/api/trainee-invitations`,
    {
      email,
      monthlyPriceAmount,
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
