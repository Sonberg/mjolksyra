import { z } from "zod";
import { ExerciseType } from "@/lib/exercisePrescription";
import { workoutSchema } from "@/services/plannedWorkouts/schema";

export const completedExercisePrescriptionSchema = z.object({
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

export const completedExerciseSchema = z.object({
  id: z.string(),
  exerciseId: z.string().nullable(),
  name: z.string().nullable(),
  note: z.string().nullable(),
  isDone: z.boolean().default(false),
  prescription: completedExercisePrescriptionSchema.nullable().optional().default(null),
});

export const completedWorkoutMediaSchema = z.object({
  rawUrl: z.string(),
  compressedUrl: z.string().nullable().optional(),
  type: z.enum(["Image", "Video"]),
});

export const completedWorkoutSchema = z.object({
  id: z.string(),
  plannedWorkoutId: z.string(),
  traineeId: z.string(),
  plannedAt: z.string(),
  exercises: z.array(completedExerciseSchema),
  completedAt: z.coerce.date().nullable().optional(),
  reviewedAt: z.coerce.date().nullable().optional(),
  media: z.array(completedWorkoutMediaSchema).optional().default([]),
  createdAt: z.coerce.date().nullable(),
});

export const workoutSessionResponseSchema = z.object({
  id: z.string(),
  exercises: z.array(completedExerciseSchema),
  completedAt: z.coerce.date().nullable().optional(),
  reviewedAt: z.coerce.date().nullable().optional(),
  media: z.array(completedWorkoutMediaSchema).optional().default([]),
  createdAt: z.coerce.date(),
});

export const workoutResponseSchema = workoutSchema.extend({
  plannedWorkoutId: z.string(),
  session: workoutSessionResponseSchema.nullable().optional().default(null),
});
