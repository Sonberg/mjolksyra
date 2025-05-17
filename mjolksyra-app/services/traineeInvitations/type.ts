import { z } from "zod";
import { schema } from "./schema";

export type TraineeInvitation = z.infer<typeof schema>;
