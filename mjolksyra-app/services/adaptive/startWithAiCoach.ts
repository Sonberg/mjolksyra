import { ApiClient } from "../client";
import { z } from "zod";

const schema = z.object({
  traineeId: z.string(),
});

type Args = {
  accessToken: string;
};

export async function startWithAiCoach({ accessToken }: Args) {
  const response = await ApiClient.post(
    "/api/onboarding/start-with-ai-coach",
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const parsed = await schema.safeParseAsync(response.data);
  if (!parsed.success) throw new Error(parsed.error.message);

  return parsed.data;
}
