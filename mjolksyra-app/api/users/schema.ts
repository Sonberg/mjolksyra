import { z } from "zod";

export const userOnboardingStatus = z.enum([
  "NotStarted",
  "Started",
  "Completed",
]);

export const userTraineeSchema = z.object({
  traineeId: z.string(),
  givenName: z.string().nullable(),
  familyName: z.string().nullable(),
  status: z.enum(["Active", "PendingInvitation"]),
});

export const userSchema = z.object({
  id: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  athletes: z.array(userTraineeSchema),
  coaches: z.array(userTraineeSchema),
  onboarding: z.object({
    athlete: userOnboardingStatus,
    coach: userOnboardingStatus,
  }),
});
