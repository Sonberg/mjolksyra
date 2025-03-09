import { z } from "zod";

export const schema = z.object({
  id: z.string(),
  coach: z.object({
    familyName: z.string(),
    givenName: z.string(),
  }),
  acceptedAt: z.coerce.date().nullable(),
  rejectedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date().nullable(),
});
