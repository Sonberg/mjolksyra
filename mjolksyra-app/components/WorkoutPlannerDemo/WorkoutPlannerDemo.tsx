"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExerciseLibrary } from "../ExerciseLibrary";
import { WorkoutPlanner } from "../WorkoutPlanner/WorkoutPlanner";
import { v4 } from "uuid";
import { Exercise } from "@/api/exercises/type";
import { PlannedWorkout } from "@/api/plannedWorkouts/type";
import { useRef } from "react";

const queryClient = new QueryClient();

export function WorkoutPlannerDemo() {
  const exercises = useRef<Exercise[]>([
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
  ]);

  const plannedWorkouts = useRef<PlannedWorkout[]>([]);

  return (
    <div className="">
      <QueryClientProvider client={queryClient}>
        <WorkoutPlanner
          traineeId={""}
          oneMonthOnly
          library={
            <ExerciseLibrary
              exercies={{
                starred: async () => {
                  return {
                    data: exercises.current.filter((x) => x.starred),
                    next: null,
                  };
                },
                star: async ({ exerciseId, state }) => {
                  exercises.current = exercises.current.map((x) =>
                    x.id === exerciseId ? { ...x, starred: state } : x
                  );
                },
                search: async () => {
                  return {
                    data: [],
                    next: null,
                  };
                },
                get: async () => {
                  return {
                    data: exercises.current,
                    next: null,
                  };
                },
                delete: async ({ id }) => {
                  exercises.current = exercises.current.filter(
                    (x) => x.id !== id
                  );
                },
                create: async (val) => {
                  const newExercise = {
                    id: v4(),
                    ...val,
                    canDelete: true,
                    starred: false,
                  };

                  exercises.current = [...exercises.current, newExercise];

                  return newExercise;
                },
              }}
            />
          }
          plannedWorkouts={{
            update: async ({ plannedWorkout }) => {
              plannedWorkouts.current = plannedWorkouts.current.map((x) =>
                x.id === plannedWorkout.id ? plannedWorkout : x
              );

              return plannedWorkout;
            },
            create: async ({ plannedWorkout }) => {
              plannedWorkouts.current = [
                ...plannedWorkouts.current,
                {
                  ...plannedWorkout,
                  id: v4(),
                  createdAt: new Date(),
                },
              ];

              return plannedWorkout;
            },
            delete: async ({ plannedWorkout }) => {
              plannedWorkouts.current = plannedWorkouts.current.filter(
                (x) => x.id !== plannedWorkout.id
              );
            },
            get: async () => {
              return {
                data: plannedWorkouts.current ?? [],
                next: null,
              };
            },
          }}
        />
      </QueryClientProvider>
    </div>
  );
}
