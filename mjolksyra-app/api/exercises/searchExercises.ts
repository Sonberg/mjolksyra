import { z } from "zod";
import { ApiClient } from "../client";
import { schema } from "./schema";
import { Exercise } from "./type";
import { paginated } from "../schema";

type Args = {
  freeText: string;
  signal: AbortSignal;
};

export async function searchExercises({ freeText, signal }: Args) {
  const response = await ApiClient.post<Exercise>(
    "/api/exercises/search",
    {
      freeText,
    },
    {
      signal,
    }
  );

  const parsed = await paginated(schema).safeParseAsync(response.data);
  console.log(parsed.error);

  if (!parsed.success) {
    throw new Error("Failed to parse data");
  }

  return parsed.data;
}
