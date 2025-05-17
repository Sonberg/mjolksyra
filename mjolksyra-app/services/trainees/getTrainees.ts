import { z } from "zod";
import { ApiClient } from "../client";
import { schema } from "./schema";

type Args = {
  signal?: AbortSignal;
  accessToken?: string;
};

export async function getTrainees({ signal, accessToken }: Args) {
  const response = await ApiClient.get(`/api/trainees`, {
    signal,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const parsed = await z.array(schema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
