import { z } from "zod";

const transactionSchema = z.object({
  id: z.string(),
  status: z.enum(["Succeeded", "Failed", "Refunded"]),
  amount: z.number(),
  currency: z.string(),
  createdAt: z.coerce.date(),
  receiptUrl: z.string().nullable().optional().default(null),
});

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  givenName: z.string(),
  familyName: z.string(),
});

const costSchema = z.object({
  currency: z.string(),
  total: z.number(),
});

const billingSchema = z.object({
  status: z.enum([
    "PriceNotSet",
    "AwaitingAthletePaymentMethod",
    "AwaitingCoachStripeSetup",
    "SubscriptionActive",
    "PriceSet",
    "PaymentFailed",
  ]),
  hasPrice: z.boolean(),
  hasSubscription: z.boolean(),
  lastChargedAt: z.coerce.date().nullable(),
  nextChargedAt: z.coerce.date().nullable(),
});

const defaultBilling = {
  status: "PriceNotSet" as const,
  hasPrice: false,
  hasSubscription: false,
  lastChargedAt: null,
  nextChargedAt: null,
};

export const schema = z.object({
  id: z.string(),
  athlete: userSchema,
  coach: userSchema,
  cost: costSchema.nullable(),
  billing: billingSchema.optional().default(defaultBilling),
  nextWorkoutAt: z.coerce.date().nullable(),
  lastWorkoutAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  transactions: z.array(transactionSchema).optional().default([]),
  hasInsightsAlert: z.boolean().optional().default(false),
});
