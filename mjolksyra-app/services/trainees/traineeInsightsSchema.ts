import { z } from "zod";

const athleteProfileSchema = z.object({
  summary: z.string(),
  trainingAge: z.enum(["beginner", "intermediate", "advanced"]),
});

const fatigueRiskSchema = z.object({
  level: z.enum(["low", "medium", "high"]),
  score: z.number(),
  explanation: z.string(),
});

const exerciseTrendSchema = z.object({
  name: z.string(),
  trend: z.enum(["improving", "plateauing", "declining"]),
  detail: z.string(),
});

const progressionSummarySchema = z.object({
  overall: z.enum(["improving", "plateauing", "declining"]),
  summary: z.string(),
  exercises: z.array(exerciseTrendSchema),
});

const strengthSchema = z.object({
  label: z.string(),
  detail: z.string(),
  exerciseRef: z.string().nullable().optional(),
});

const weaknessSchema = z.object({
  label: z.string(),
  detail: z.string(),
  exerciseRef: z.string().nullable().optional(),
});

const recommendationSchema = z.object({
  label: z.string(),
  detail: z.string(),
  priority: z.enum(["high", "medium", "low"]),
});

export const traineeInsightsSchema = z.object({
  status: z.enum(["ready", "pending", "failed"]),
  generatedAt: z.coerce.date().nullable(),
  visibleToAthlete: z.boolean(),
  athleteProfile: athleteProfileSchema.nullable().optional(),
  fatigueRisk: fatigueRiskSchema.nullable().optional(),
  progressionSummary: progressionSummarySchema.nullable().optional(),
  strengths: z.array(strengthSchema),
  weaknesses: z.array(weaknessSchema),
  recommendations: z.array(recommendationSchema),
});

export type TraineeInsights = z.infer<typeof traineeInsightsSchema>;
