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
  completionNote: z.string().nullable().optional(),
  plannedAt: z.string(),
  completedAt: z.coerce.date().nullable().optional(),
  reviewedAt: z.coerce.date().nullable().optional(),
  reviewNote: z.string().nullable().optional(),
  exercises: z.array(exerciseSchema),
  createdAt: z.coerce.date().nullable(),
  appliedBlock: z
    .object({
      blockId: z.string(),
      blockName: z.string(),
      startDate: z.string(),
      weekNumber: z.number(),
      totalWeeks: z.number(),
    })
    .nullable()
    .optional()
    .default(null),
});
