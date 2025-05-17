import { z } from "zod";
import { userInvitationSchema, userSchema, userTraineeSchema } from "./schema";

export type User = z.infer<typeof userSchema>;
export type UserTrainee = z.infer<typeof userTraineeSchema>;
export type UserInvitation = z.infer<typeof userInvitationSchema>;
