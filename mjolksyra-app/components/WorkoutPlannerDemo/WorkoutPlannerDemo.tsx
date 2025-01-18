"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExerciseLibrary } from "../ExerciseLibrary";
import { WorkoutPlanner } from "../WorkoutPlanner/WorkoutPlanner";
import { v4 } from "uuid";
import { Exercise } from "@/api/exercises/type";
import { PlannedWorkout } from "@/api/plannedWorkouts/type";

const queryClient = new QueryClient();
const exercises: Exercise[] = [
  {
    id: v4(),
    name: "Bench press",
    force: null,
    level: null,
    mechanic: null,
    equipment: null,
    category: null,
    starred: false,
    canDelete: false,
  },
  {
    id: v4(),
    name: "Leg press",
    force: null,
    level: null,
    mechanic: null,
    equipment: null,
    category: null,
    starred: false,
    canDelete: false,
  },
  {
    id: v4(),
    name: "Pull ups",
    force: null,
    level: null,
    mechanic: null,
    equipment: null,
    category: null,
    starred: false,
    canDelete: false,
  },
];

const plannedWorkouts: PlannedWorkout[] = [];

export function WorkoutPlannerDemo() {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkoutPlanner
        traineeId={""}
        oneMonthOnly
        library={
          <ExerciseLibrary
            exercies={{
              starred: async () => {
                return {
                  data: [],
                  next: null,
                };
              },
              star: async () => {},
              search: async () => {
                return {
                  data: [],
                  next: null,
                };
              },
              get: async () => {
                return {
                  data: exercises,
                  next: null,
                };
              },
              delete: async () => {},
              create: async (val) => ({
                id: v4(),
                ...val,
                canDelete: true,
                starred: false,
              }),
            }}
          />
        }
        plannedWorkouts={{
          update: async (val) => val.plannedWorkout,
          create: async (val) => val.plannedWorkout,
          delete: async () => {},
          get: async () => {
            return {
              data: plannedWorkouts,
              next: null,
            };
          },
        }}
      />
    </QueryClientProvider>
  );
}
