import { z } from "zod";

export const adminStatsSchema = z.object({
  totalUsers: z.number(),
  totalCoaches: z.number(),
  totalAthletes: z.number(),
  activeSubscriptions: z.number(),
  totalRevenue: z.number(),
});

export const feedbackReportItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  email: z.string().nullable(),
  message: z.string(),
  pageUrl: z.string().nullable(),
  status: z.string(),
  createdAt: z.coerce.date(),
});

export const feedbackReportListSchema = z.array(feedbackReportItemSchema);

export const updateFeedbackStatusResultSchema = z.object({
  id: z.string(),
  status: z.string(),
});

export const coachRevenueItemSchema = z.object({
  coachUserId: z.string(),
  coachName: z.string(),
  coachEmail: z.string(),
  activeSubscriptions: z.number(),
  monthlyAthleteRevenue: z.number(),
  totalAthleteRevenue: z.number(),
  billingSetupStatus: z.string(),
  platformFeeStatus: z.string(),
  platformFeeTrialEndsAt: z.coerce.date().nullable(),
});

export const coachRevenueListSchema = z.array(coachRevenueItemSchema);

export type AdminStats = z.infer<typeof adminStatsSchema>;
export type FeedbackReportItem = z.infer<typeof feedbackReportItemSchema>;
export type UpdateFeedbackStatusResult = z.infer<typeof updateFeedbackStatusResultSchema>;
export type CoachRevenueItem = z.infer<typeof coachRevenueItemSchema>;
