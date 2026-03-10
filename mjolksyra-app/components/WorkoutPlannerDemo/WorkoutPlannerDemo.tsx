"use client";

import { ExerciseLibrary } from "../ExerciseLibrary";
import { WorkoutPlanner } from "../WorkoutPlanner/WorkoutPlanner";
import { v4 } from "uuid";
import { Exercise } from "@/services/exercises/type";
import type { SearchExercises } from "@/services/exercises/searchExercises";
import { PlannedExercise, PlannedWorkout } from "@/services/plannedWorkouts/type";
import { useCallback, useMemo, useRef } from "react";
import { search } from "fast-fuzzy";
import dayjs from "dayjs";

function createInitialExercises(): Exercise[] {
  const names = [
    "Bench press",
    "Incline dumbbell press",
    "Paused back squat",
    "Front squat",
    "Romanian deadlift",
    "Conventional deadlift",
    "Pull ups",
    "Chest-supported row",
    "Barbell overhead press",
    "Single-arm dumbbell row",
    "Bulgarian split squat",
    "Walking lunges",
    "Leg press",
    "Seated hamstring curl",
    "Cable triceps extension",
    "Biceps curl",
    "Hanging leg raise",
    "Plank hold",
    "30s bike sprint",
    "1000m row",
    "Easy run 20 min",
    "Tempo run 5 km",
    "Interval run 8 x 400m",
    "Assault bike 12 min",
    "SkiErg 1500m",
    "Jump rope 5 min",
    "Dynamic warmup flow",
    "Hip mobility warmup",
    "Ankle activation warmup",
    "Band shoulder warmup",
  ];

  return names.map((name) => ({
    id: v4(),
    name,
    force: null,
    level: null,
    mechanic: null,
    category: null,
    starred: false,
    canDelete: false,
  }));
}

function buildPlannedExercise(exercise: Exercise): PlannedExercise {
  return {
    id: v4(),
    exerciseId: exercise.id,
    name: exercise.name,
    note: null,
    isPublished: true,
    isDone: false,
    prescription: null,
    images: [],
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
      completionNote: null,
      plannedAt: plannedAt.format("YYYY-MM-DD"),
      completedAt: null,
      reviewedAt: null,
      reviewNote: null,
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
  const initialExercises = useMemo(() => createInitialExercises(), []);
  const initialPlannedWorkouts = useMemo(
    () => createInitialPlannedWorkouts(initialExercises),
    [initialExercises],
  );

  const exercises = useRef<Exercise[]>(initialExercises);
  const plannedWorkouts = useRef<PlannedWorkout[]>(initialPlannedWorkouts);
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
                    force: null,
                    level: null,
                    mechanic: null,
                    category: null,
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
        exerciseSearch={demoExerciseSearch}
      />
    </div>
  );
}
