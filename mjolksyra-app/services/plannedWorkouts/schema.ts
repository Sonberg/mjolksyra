import { z } from "zod";

export const exerciseSchema = z.object({
  id: z.string(),
  exerciseId: z.string().nullable(),
  name: z.string(),
  note: z.string().nullable(),
  images: z.array(z.string()),
});

export const workoutSchema = z.object({
  id: z.string(),
  traineeId: z.string(),
  name: z.string().nullable(),
  note: z.string().nullable(),
  plannedAt: z.string(),
  exercises: z.array(exerciseSchema),
  createdAt: z.coerce.date().nullable(),
});
