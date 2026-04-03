import { z } from "zod";

import { exerciseSchema, workoutChatMessageSchema, workoutMediaAnalysisSchema, workoutSchema } from "./schema";

export type PlannedExercise = z.infer<typeof exerciseSchema>;
export type PlannedWorkout = z.infer<typeof workoutSchema>;
export type PlannedWorkoutChatMessage = z.infer<typeof workoutChatMessageSchema>;
export type WorkoutMediaAnalysis = z.infer<typeof workoutMediaAnalysisSchema>;
