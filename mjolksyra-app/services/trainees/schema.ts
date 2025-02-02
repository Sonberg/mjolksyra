import { z } from "zod";

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  givenName: z.string(),
  familyName: z.string(),
});

const priceSchema = z.object({
  currency: z.string(),
  amount: z.number(),
});

export const schema = z.object({
  id: z.string(),
  athlete: userSchema,
  coach: userSchema,
  price: priceSchema.nullable(),
  nextWorkoutAt: z.coerce.date().nullable(),
  lastWorkoutAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});
