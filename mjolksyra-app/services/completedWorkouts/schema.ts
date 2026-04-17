import { z } from "zod";
import { ExerciseType } from "@/lib/exercisePrescription";
import { exerciseSchema } from "@/services/plannedWorkouts/schema";

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
  plannedWorkoutId: z.string().nullable().optional().default(null),
  traineeId: z.string(),
  plannedAt: z.string(),
  exercises: z.array(completedExerciseSchema),
  completedAt: z.coerce.date().nullable().optional(),
  skippedAt: z.coerce.date().nullable().optional().default(null),
  media: z.array(completedWorkoutMediaSchema).optional().default([]),
  createdAt: z.coerce.date().nullable(),
  hasUnreadActivity: z.boolean().optional().default(false),
});

export const workoutChatMessageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  message: z.string(),
  media: z.array(completedWorkoutMediaSchema).optional().default([]),
  role: z.enum(["Athlete", "Coach"]),
  createdAt: z.coerce.date(),
  modifiedAt: z.coerce.date(),
});

export const workoutMediaAnalysisSchema = z.object({
  summary: z.string(),
  keyFindings: z.array(z.string()).default([]),
  techniqueRisks: z.array(z.string()).default([]),
  coachSuggestions: z.array(z.string()).default([]),
  createdAt: z.coerce.date(),
});
