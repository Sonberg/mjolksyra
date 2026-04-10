import { z } from "zod";
import { completedExerciseSchema, completedWorkoutSchema, workoutResponseSchema, workoutSessionResponseSchema } from "./schema";

export type CompletedExercise = z.infer<typeof completedExerciseSchema>;
export type CompletedWorkout = z.infer<typeof completedWorkoutSchema>;
export type WorkoutSessionResponse = z.infer<typeof workoutSessionResponseSchema>;
export type WorkoutResponse = z.infer<typeof workoutResponseSchema>;
