import { insertAt } from "@/lib/insertAt";
import { v4 } from "uuid";
import { create } from "zustand";

export type PlannedExercise = {
  id: string;
  exerciseId: string;
  name: string;
  note?: string;
};

export type PlannedWorkout = {
  id: string;
  name: string;
  date: string;
  exercises: PlannedExercise[];
};

type AddExercise = {
  date: string;
  exerciseId: string;
  name: string;
  index?: number;
};

type MoveExercise = {
  plannedExerciseId: string;
  sourceWorkoutId: string;
  targetDate: string;
  index?: number;
  clone?: boolean;
};

type DeleteExercise = {
  workoutId: string;
  exerciseId: string;
};

type PlannerState = {
  workouts: PlannedWorkout[];
  load: (userId: string) => Promise<void>;
  upsert: (workout: PlannedWorkout) => void;
  addExercise: (data: AddExercise) => void;
  moveExercise: (data: MoveExercise) => void;
  deleteExercise: (data: DeleteExercise) => void;
};

export const usePlannerStore = create<PlannerState>((set) => ({
  workouts: [],
  load: (userId: string) =>
    new Promise((res) => {
      set({ workouts: [] });
      res();
    }),
  upsert: (workout: PlannedWorkout) =>
    set((state) =>
      state.workouts.find((x) => x.date === workout.date)
        ? {
            workouts: state.workouts.map((x) =>
              x.date === workout.date
                ? {
                    ...x,
                    ...workout,
                    exercises: [...x.exercises, ...workout.exercises],
                  }
                : x
            ),
          }
        : { workouts: [...state.workouts, workout] }
    ),
  addExercise(data) {
    return set((state) => {
      const exisingWorkout = state.workouts.find((x) => x.date === data.date);

      if (!exisingWorkout) {
        return {
          ...state,
          workouts: [
            ...state.workouts,
            {
              id: v4(),
              name: "",
              date: data.date,
              exercises: [
                { id: v4(), exerciseId: data.exerciseId, name: data.name },
              ],
            },
          ],
        };
      }

      exisingWorkout.exercises = insertAt(
        exisingWorkout.exercises,
        data.index,
        { id: v4(), exerciseId: data.exerciseId, name: data.name }
      );

      return {
        ...state,
      };
    });
  },
  moveExercise(data) {
    return set((state) => {
      const sourceWorkout = state.workouts.find(
        (x) => x.id === data.sourceWorkoutId
      );

      const targetWorkout = state.workouts.find(
        (x) => x.date === data.targetDate
      );

      if (!sourceWorkout) {
        return state;
      }

      const existingExercise = sourceWorkout?.exercises.find(
        (x) => x.id === data.plannedExerciseId
      );

      if (!existingExercise) {
        return state;
      }

      const exercise = {
        ...existingExercise,
        id: data.clone ? v4() : existingExercise.id,
      };

      if (!data.clone) {
        sourceWorkout.exercises = sourceWorkout.exercises.filter(
          (x) => x.id !== data.plannedExerciseId
        );
      }

      if (targetWorkout) {
        targetWorkout.exercises = insertAt(
          targetWorkout.exercises,
          data.index,
          exercise
        );
      } else {
        state.workouts.push({
          id: v4(),
          name: "",
          date: data.targetDate,
          exercises: [exercise],
        });
      }

      return state;
    });
  },
  deleteExercise(data) {
    return set((state) => {
      const workout = state.workouts.find((x) => x.id == data.workoutId);
      if (!workout) {
        return state;
      }

      workout.exercises = workout.exercises.filter(
        (x) => x.id !== data.exerciseId
      );

      return {
        ...state,
      };
    });
  },
}));
