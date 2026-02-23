import { z } from "zod";
import { blockExerciseSchema, blockSchema, blockWorkoutSchema } from "./schema";

export type BlockExercise = z.infer<typeof blockExerciseSchema>;
export type BlockWorkout = z.infer<typeof blockWorkoutSchema>;
export type Block = z.infer<typeof blockSchema>;
