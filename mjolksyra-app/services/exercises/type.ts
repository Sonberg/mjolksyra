import { z } from "zod";
import { schema } from "./schema";

export type Exercise = z.infer<typeof schema>;
