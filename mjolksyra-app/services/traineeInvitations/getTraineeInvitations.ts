import { z } from "zod";
import { ApiClient } from "../client";
import { schema } from "./schema";

type Args = {
  signal?: AbortSignal;
};

export async function getTraineeInvitations({ signal }: Args) {
  const response = await ApiClient.get(`/api/trainee-invitations`, {
    signal,
  });
  const parsed = await z.array(schema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error("Failed to parse data");
  }

  return parsed.data!;
}
