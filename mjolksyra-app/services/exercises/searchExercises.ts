import { z } from "zod";
import { ApiClient } from "../client";
import { schema } from "./schema";
import { Exercise } from "./type";
import { paginated } from "../schema";

type Args = {
  freeText: string;
  filters: {
    sport: string | null;
    level: string | null;
    createdByMe: boolean;
  };
  signal: AbortSignal;
};

export type SearchExercises = typeof searchExercises;

export async function searchExercises({ freeText, filters, signal }: Args) {
  const response = await ApiClient.post<Exercise>(
    "/api/exercises/search",
    {
      freeText,
      sport: filters.sport,
      level: filters.level,
      createdByMe: filters.createdByMe,
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
