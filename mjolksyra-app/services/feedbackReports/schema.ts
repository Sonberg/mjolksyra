import { z } from "zod";

export const feedbackReportResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  createdAt: z.coerce.date(),
});
