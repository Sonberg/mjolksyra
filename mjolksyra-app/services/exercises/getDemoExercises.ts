import { paginated } from "../schema";
import { schema } from "./schema";

export async function getDemoExercises() {
  const response = await fetch("/api/exercises/demo");
  const json = await response.json();
  const parsed = await paginated(schema).safeParseAsync(json);

  if (!parsed.success) {
    throw new Error("Failed to parse demo exercises");
  }

  return parsed.data;
}
