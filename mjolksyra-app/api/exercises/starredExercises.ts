import { ApiClient } from "../client";
import { schema } from "./schema";
import { Exercise } from "./type";
import { paginated } from "../schema";

export type StarredExercises = typeof starredExercises;

export async function starredExercises() {
  const response = await ApiClient.get<Exercise>("/api/exercises/starred");
  const parsed = await paginated(schema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error("Failed to parse data");
  }

  return parsed.data;
}
