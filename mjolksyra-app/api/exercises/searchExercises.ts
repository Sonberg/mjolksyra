import { z } from "zod";
import { ApiClient } from "../client";
import { schema } from "./schema";
import { Exercise } from "./type";

type Args = {
  freeText: string;
};

export async function searchExercises({ freeText }: Args) {
  const response = await ApiClient.post<Exercise>("/api/exercises/search", {
    freeText,
  });

  const parsed = await z.array(schema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error("Failed to parse data");
  }

  return parsed.data;
}
