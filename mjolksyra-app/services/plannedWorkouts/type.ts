import { z } from "zod";

import { exerciseSchema, workoutSchema } from "./schema";

export type PlannedExercise = z.infer<typeof exerciseSchema>;
export type PlannedWorkout = z.infer<typeof workoutSchema>;
