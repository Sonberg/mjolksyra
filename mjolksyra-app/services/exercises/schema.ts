import { z } from "zod";

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  force: z.string().nullable(),
  level: z.string().nullable(),
  mechanic: z.string().nullable(),
  equipment: z.string().nullable(),
  category: z.string().nullable(),
  starred: z.boolean(),
  canDelete: z.boolean(),
});
