import { z } from "zod";
import { schema } from "./schema";

export type Trainee = z.infer<typeof schema>;
