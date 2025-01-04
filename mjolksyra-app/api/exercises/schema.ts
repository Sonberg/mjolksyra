import { z } from "zod";

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  force: z.string(),
  level: z.string(),
  mechanic: z.string(),
  equipment: z.string(),
  category: z.string(),
});