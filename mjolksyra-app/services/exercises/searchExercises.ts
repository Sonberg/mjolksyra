import { z } from "zod";
import { ApiClient } from "../client";
import { schema } from "./schema";
import { Exercise } from "./type";
import { paginated } from "../schema";

type Args = {
  freeText: string;
  filters: {
    force: string | null;
    level: string | null;
    mechanic: string | null;
    category: string | null;
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
      force: filters.force,
      level: filters.level,
      mechanic: filters.mechanic,
      category: filters.category,
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
