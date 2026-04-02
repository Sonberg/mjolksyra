"use client";

import { ExerciseLibrary } from "../ExerciseLibrary";
import { WorkoutPlanner } from "../WorkoutPlanner/WorkoutPlanner";
import { v4 } from "uuid";
import { Exercise } from "@/services/exercises/type";
import type { SearchExercises } from "@/services/exercises/searchExercises";
import { PlannedExercise, PlannedWorkout } from "@/services/plannedWorkouts/type";
import { useCallback, useEffect, useRef, useState } from "react";
import { search } from "fast-fuzzy";
import dayjs from "dayjs";
import { getDemoExercises } from "@/services/exercises/getDemoExercises";

function buildPlannedExercise(exercise: Exercise): PlannedExercise {
  return {
    id: v4(),
    exerciseId: exercise.id,
    name: exercise.name,
    note: null,
    isPublished: true,
    isDone: false,
    prescription: null,
  };
}

function createInitialPlannedWorkouts(exercises: Exercise[]): PlannedWorkout[] {
  if (!exercises.length) return [];

  const dates = [
    dayjs().subtract(2, "month").date(6),
    dayjs().subtract(1, "month").date(14),
    dayjs().subtract(1, "month").date(25),
    dayjs().date(5),
    dayjs().date(12),
    dayjs().add(1, "month").date(8),
    dayjs().add(1, "month").date(18),
    dayjs().add(2, "month").date(3),
  ];

  return dates.map((plannedAt, index) => {
    const first = exercises[(index * 2) % exercises.length];
    const second = exercises[(index * 2 + 1) % exercises.length];
    const third = exercises[(index * 2 + 2) % exercises.length];

    return {
      id: v4(),
      traineeId: "",
      name: index % 2 === 0 ? "Strength day" : "Mixed day",
      note: index % 2 === 0 ? "Focus on controlled tempo." : null,
      media: [],
      plannedAt: plannedAt.format("YYYY-MM-DD"),
      completedAt: null,
      reviewedAt: null,
      exercises: [
        buildPlannedExercise(first),
        buildPlannedExercise(second),
        buildPlannedExercise(third),
      ],
      createdAt: new Date(),
      appliedBlock: null,
    };
  });
}

export function WorkoutPlannerDemo() {
  const [ready, setReady] = useState(false);
  const exercises = useRef<Exercise[]>([]);
  const plannedWorkouts = useRef<PlannedWorkout[]>([]);

  useEffect(() => {
    getDemoExercises().then(({ data }) => {
      exercises.current = data;
      plannedWorkouts.current = createInitialPlannedWorkouts(data);
      setReady(true);
    });
  }, []);

  const demoExerciseSearch = useCallback<SearchExercises>(
    async ({ freeText }) => {
      return {
        data: search(freeText, exercises.current, {
          keySelector: (obj) => obj.name,
        }),
        next: null,
      };
    },
    [],
  );

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent opacity-40" />
      </div>
    );
  }

  return (
    <div className="h-full">
      <WorkoutPlanner
        traineeId={""}
        rightSide={
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
                return demoExerciseSearch({
                  freeText,
                  filters: {
                    sports: [],
                    levels: [],
                    createdByMe: false,
                  },
                  signal: new AbortController().signal,
                });
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
                const newExercise: Exercise = {
                  id: v4(),
                  name: val.name,
                  sports: val.sport ? [val.sport as Exercise["sports"][number]] : [],
                  level: val.level as Exercise["level"],
                  type: val.type as Exercise["type"],
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
        exerciseSearch={demoExerciseSearch}
      />
    </div>
  );
}
