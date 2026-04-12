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
  athletes: z.array(
    z.object({
      athleteUserId: z.string(),
      athleteName: z.string(),
      athleteEmail: z.string(),
      relationshipStatus: z.string(),
      billingStatus: z.string(),
    }),
  ),
});

export const coachRevenueListSchema = z.array(coachRevenueItemSchema);

export const discountCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string(),
  maxRedemptions: z.number().nullable(),
  redeemedCount: z.number(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
});

export const discountCodeListSchema = z.array(discountCodeSchema);

export const createDiscountCodeResultSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string(),
});

export const attachmentIntegritySummarySchema = z.object({
  totalReferencedMediaUrls: z.number(),
  totalR2Objects: z.number(),
  orphanObjectCount: z.number(),
  rawWithCompressedCount: z.number(),
  deadReferenceCount: z.number(),
});

export const orphanMediaObjectSchema = z.object({
  key: z.string(),
  sizeBytes: z.number(),
  lastModifiedAt: z.coerce.date().nullable().optional(),
});

export const rawWithCompressedSchema = z.object({
  sourceType: z.string(),
  traineeId: z.string(),
  ownerId: z.string(),
  rawUrl: z.string(),
  rawKey: z.string(),
  compressedUrl: z.string(),
  compressedKey: z.string(),
});

export const deadMediaReferenceSchema = z.object({
  sourceType: z.string(),
  traineeId: z.string(),
  ownerId: z.string(),
  url: z.string(),
  key: z.string().nullable().optional(),
  reason: z.string(),
});

export const attachmentIntegrityReportSchema = z.object({
  generatedAt: z.coerce.date(),
  summary: attachmentIntegritySummarySchema,
  orphanObjects: z.array(orphanMediaObjectSchema),
  rawWithCompressed: z.array(rawWithCompressedSchema),
  deadReferences: z.array(deadMediaReferenceSchema),
});

export type AdminStats = z.infer<typeof adminStatsSchema>;
export type FeedbackReportItem = z.infer<typeof feedbackReportItemSchema>;
export type UpdateFeedbackStatusResult = z.infer<typeof updateFeedbackStatusResultSchema>;
export type CoachRevenueItem = z.infer<typeof coachRevenueItemSchema>;
export type DiscountCode = z.infer<typeof discountCodeSchema>;
export type CreateDiscountCodeResult = z.infer<typeof createDiscountCodeResultSchema>;
export type AttachmentIntegrityReport = z.infer<typeof attachmentIntegrityReportSchema>;
