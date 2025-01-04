import { ApiClient } from "../client";
import { paginated } from "../schema";
import { schema } from "./schema";

type Args = {
  cursor?: string | null;
};

export async function getExercises({ cursor }: Args) {
  const url = cursor ? `/api/exercises?cursor=${cursor}` : `/api/exercises`;
  const response = await ApiClient.get(url);
  const parsed = await paginated(schema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error("Failed to parse data");
  }

  return parsed.data;
}
