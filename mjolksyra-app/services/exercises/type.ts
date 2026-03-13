import { z } from "zod";
import {
  exerciseLevelSchema,
  exerciseSportSchema,
  exerciseTypeSchema,
  schema,
} from "./schema";

export type Exercise = z.infer<typeof schema>;
export type ExerciseSport = z.infer<typeof exerciseSportSchema>;
export type ExerciseType = z.infer<typeof exerciseTypeSchema>;
export type ExerciseLevel = z.infer<typeof exerciseLevelSchema>;
