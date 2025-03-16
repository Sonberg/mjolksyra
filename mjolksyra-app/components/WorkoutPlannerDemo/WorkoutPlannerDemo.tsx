"use client";

import { ExerciseLibrary } from "../ExerciseLibrary";
import { WorkoutPlanner } from "../WorkoutPlanner/WorkoutPlanner";
import { v4 } from "uuid";
import { Exercise } from "@/services/exercises/type";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { useRef } from "react";
import { search } from "fast-fuzzy";

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
              search: async ({ freeText }) => {
                return {
                  data: search(freeText, exercises.current, {
                    keySelector: (obj) => obj.name,
                  }),
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
    </div>
  );
}
