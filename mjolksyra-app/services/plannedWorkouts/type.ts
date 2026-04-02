import { z } from "zod";

import { exerciseSchema, workoutChatMessageSchema, workoutSchema } from "./schema";

export type PlannedExercise = z.infer<typeof exerciseSchema>;
export type PlannedWorkout = z.infer<typeof workoutSchema>;
export type PlannedWorkoutChatMessage = z.infer<typeof workoutChatMessageSchema>;
