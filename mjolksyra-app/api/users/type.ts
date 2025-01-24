import { z } from "zod";
import { userSchema, userTraineeSchema } from "./schema";

export type User = z.infer<typeof userSchema>;
export type UserTrainee = z.infer<typeof userTraineeSchema>;
