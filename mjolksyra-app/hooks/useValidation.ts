import { useState, useCallback, useMemo } from "react";
import z, { ZodObject, ZodSchema } from "zod";

const schema2 = z.object({
  test: z.string(),
});

type Args<T> = {
  schema: ZodSchema<T>;
  values: T;
};

export function useValidation<T>({ schema, values }: Args<T>) {
  const [errors, setErrors] = useState<(string | number)[]>([]);

  const parsed = useMemo(() => schema.safeParse(values), [schema, values]);

  return useMemo(
    () => ({
      success: parsed.success,
      parsed: parsed.success ? parsed.data : null,
      errors:
        parsed.error?.errors.reduce((prev, current) => {
          const key = current.path[0];
          if (!errors.includes(key)) {
            return prev;
          }

          return {
            ...prev,
            [key]: current.message,
          };
        }, {}) ?? {},
      showError: (key: string) => {
        setErrors((state) => [...state, key]);
      },
      showAllError: () => {
        setErrors(parsed.error?.errors.map((x) => x.path[0]) ?? []);
      },
    }),
    [parsed]
  );
}
