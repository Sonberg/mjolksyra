import { z } from "zod";
import { ApiClient } from "../client";
import { schema } from "./schema";
import { Exercise } from "./type";
import { paginated } from "../schema";

type Args = {
  freeText: string;
};

export async function searchExercises({ freeText }: Args) {
  const response = await ApiClient.post<Exercise>("/api/exercises/search", {
    freeText,
  });

  const parsed = await paginated(schema).safeParseAsync(response.data);
  console.log(parsed.error);

  if (!parsed.success) {
    throw new Error("Failed to parse data");
  }

  return parsed.data;
}
