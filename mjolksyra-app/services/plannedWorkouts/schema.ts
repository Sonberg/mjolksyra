import { z } from "zod";
import { ExerciseType } from "@/lib/exercisePrescription";

export const exercisePrescriptionSchema = z.object({
  type: z.nativeEnum(ExerciseType),
  sets: z
    .array(
      z.object({
        target: z
          .object({
            reps: z.number().nullable(),
            durationSeconds: z.number().nullable(),
            distanceMeters: z.number().nullable(),
            weightKg: z.number().nullable().optional().default(null),
            note: z.string().nullable(),
          })
          .nullable()
          .optional()
          .default(null),
        actual: z
          .object({
            reps: z.number().nullable().optional().default(null),
            weightKg: z.number().nullable(),
            durationSeconds: z.number().nullable(),
            distanceMeters: z.number().nullable(),
            note: z.string().nullable().optional().default(null),
            isDone: z.boolean().default(false),
          })
          .nullable()
          .optional()
          .default(null),
      }),
    )
    .nullable()
    .optional()
    .default(null),
});

export const exerciseSchema = z.object({
  id: z.string(),
  exerciseId: z.string().nullable(),
  name: z.string(),
  note: z.string().nullable(),
  isPublished: z.boolean().optional().default(true),
  isDone: z.boolean().optional().default(false),
  prescription: exercisePrescriptionSchema.nullable().optional().default(null),
  level: z.string().nullable().optional(),
  sport: z.string().nullable().optional(),
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
