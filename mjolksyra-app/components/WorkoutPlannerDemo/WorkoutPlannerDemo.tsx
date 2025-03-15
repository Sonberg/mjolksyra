"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExerciseLibrary } from "../ExerciseLibrary";
import { WorkoutPlanner } from "../WorkoutPlanner/WorkoutPlanner";
import { v4 } from "uuid";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { useRef } from "react";
import { search } from "fast-fuzzy";
import { ExerciseResponse } from "@/generated-client";

const queryClient = new QueryClient();

export function WorkoutPlannerDemo() {
  const exercises = useRef<ExerciseResponse[]>([
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
      instructions: [],
      primaryMuscles: [],
      secondaryMuscles: [],
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
      instructions: [],
      primaryMuscles: [],
      secondaryMuscles: [],
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
      instructions: [],
      primaryMuscles: [],
      secondaryMuscles: [],
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
                star: async ({ exerciseId, starExerciseRequest }) => {
                  exercises.current = exercises.current.map((x) =>
                    x.id === exerciseId
                      ? { ...x, starred: starExerciseRequest.state }
                      : x
                  );
                },
                search: async ({ searchExercisesRequest }) => {
                  return {
                    data: search(
                      searchExercisesRequest.freeText,
                      exercises.current,
                      {
                        keySelector: (obj) => obj.name,
                      }
                    ),
                    next: null,
                  };
                },
                get: async () => {
                  return {
                    data: exercises.current,
                    next: null,
                  };
                },
                delete: async ({ exerciseId }) => {
                  const deletedExercise = exercises.current.find(
                    (x) => x.id == exerciseId
                  );

                  exercises.current = exercises.current.filter(
                    (x) => x.id !== exerciseId
                  );

                  return deletedExercise!;
                },
                create: async ({ createExerciseCommand }) => {
                  const newExercise: ExerciseResponse = {
                    id: v4(),
                    name: createExerciseCommand.name,
                    force: createExerciseCommand.force ?? null,
                    level: createExerciseCommand.level ?? null,
                    mechanic: createExerciseCommand.mechanic ?? null,
                    equipment: createExerciseCommand.equipment ?? null,
                    category: createExerciseCommand.category ?? null,
                    instructions: [],
                    primaryMuscles: [],
                    secondaryMuscles: [],
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
