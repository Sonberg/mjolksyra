import { z, ZodTypeAny } from "zod";

export function paginated<T extends ZodTypeAny>(schema: T) {
  return z.object({
    data: z.array(schema),
    next: z.string().nullable(),
  });
}
