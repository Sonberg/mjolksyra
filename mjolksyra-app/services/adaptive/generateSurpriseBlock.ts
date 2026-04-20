import { ApiClient } from "../client";
import { z } from "zod";

const schema = z.object({
  blockId: z.string(),
  traineeId: z.string(),
  startDate: z.string(),
});

type Args = {
  traineeId: string;
  accessToken: string;
};

export async function generateSurpriseBlock({ traineeId, accessToken }: Args) {
  const response = await ApiClient.post(
    `/api/adaptive/trainees/${traineeId}/blocks/surprise`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const parsed = await schema.safeParseAsync(response.data);
  if (!parsed.success) throw new Error(parsed.error.message);

  return parsed.data;
}
