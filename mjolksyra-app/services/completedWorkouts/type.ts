import { z } from "zod";
import { completedExerciseSchema, completedWorkoutSchema } from "./schema";

export type CompletedExercise = z.infer<typeof completedExerciseSchema>;
export type CompletedWorkout = z.infer<typeof completedWorkoutSchema>;
