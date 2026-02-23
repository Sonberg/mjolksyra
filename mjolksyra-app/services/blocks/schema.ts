import { z } from "zod";

export const blockExerciseSchema = z.object({
  id: z.string(),
  exerciseId: z.string().nullable(),
  name: z.string(),
  note: z.string().nullable(),
});

export const blockWorkoutSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  note: z.string().nullable(),
  exercises: z.array(blockExerciseSchema),
  week: z.number(),
  dayOfWeek: z.number(),
});

export const blockSchema = z.object({
  id: z.string(),
  coachId: z.string(),
  name: z.string(),
  numberOfWeeks: z.number(),
  workouts: z.array(blockWorkoutSchema),
  createdAt: z.coerce.date(),
});
