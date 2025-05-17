import { ApiClient } from "../client";
import { schema } from "./schema";

type Args = {
  signal?: AbortSignal;
  id?: string;
};

export async function getTrainee({ signal, id }: Args) {
  const response = await ApiClient.get(`/api/trainees/${id}`, {
    signal,
  });
  if (!response.data) {
    return null;
  }

  const parsed = await schema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
