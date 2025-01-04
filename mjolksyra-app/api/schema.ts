import { z } from "zod";

export function paginated(schema: Zod.Schema) {
  return z.object({
    data: z.array(schema),
    next: z.string().nullable(),
  });
}
