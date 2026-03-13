import { z } from "zod";

export const exerciseLevelSchema = z.enum(["Beginner", "Intermediate", "Expert"]);
export const exerciseTypeSchema = z.enum(["SetsReps", "DurationSeconds", "DistanceMeters"]);
export const exerciseSportSchema = z.enum([
  "Powerlifting",
  "Strongman",
  "OlympicWeightlifting",
  "Bodybuilding",
  "Crossfit",
  "Hyrox",
  "Calisthenics",
  "Functional",
]);

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  sports: z.array(exerciseSportSchema),
  level: exerciseLevelSchema.nullable(),
  type: exerciseTypeSchema.nullable(),
  starred: z.boolean(),
  canDelete: z.boolean(),
});
