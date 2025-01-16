import { PlannedExercise, PlannedWorkout } from "@/api/plannedWorkouts/type";
import { PLANNED_AT } from "@/constants/dateFormats";
import { insertAt } from "@/lib/insertAt";
import { arrayMove } from "@dnd-kit/sortable";
import dayjs from "dayjs";
import { v4 } from "uuid";

export type MonthWorkouts = Record<string, PlannedWorkout[]>;

type Test = "MOVE_EXERCISE" | "MOVE_WORKOUT";

export type Action =
  | {
      type: "SET_MONTH";
      payload: { monthId: string; workouts: PlannedWorkout[] };
    }
  | {
      type: "ADD_EXERCISE";
      payload: {
        traineeId: string;
        targetMonthId: string;
        targetDate: dayjs.Dayjs;
        exercise: PlannedExercise;
        index: number | null;
      };
    }
  | {
      type: "MOVE_EXERCISE";
      payload: {
        monthId: string;
        plannedWorkoutId: string;
        plannedExerciseId: string;
        index: number;
      };
    }
  | {
      type: "REMOVE_EXERCISE";
      payload: {
        monthId: string;
        plannedWorkoutId: string;
        plannedExerciseId: string;
      };
    }
  | { type: "RESET" };

export function workoutsReducer(
  state: MonthWorkouts,
  action: Action
): MonthWorkouts {
  switch (action.type) {
    case "SET_MONTH":
      return {
        ...state,
        [action.payload.monthId]: action.payload.workouts,
      };
    case "RESET":
      return {};

    case "MOVE_EXERCISE":
      return {
        ...state,
        [action.payload.monthId]: state[action.payload.monthId].map((x) =>
          x.id === action.payload.plannedWorkoutId
            ? {
                ...x,
                exercises: arrayMove(
                  x.exercises,
                  x.exercises.findIndex(
                    (y) => y.id === action.payload.plannedExerciseId
                  ),
                  action.payload.index ?? x.exercises.length - 1
                ),
              }
            : x
        ),
      };

    case "ADD_EXERCISE":
      const targetMonth = state[action.payload.targetMonthId] ?? [];
      const targetDate = action.payload.targetDate.format(PLANNED_AT);
      const existingWorkout = targetMonth.find(
        (x) => x.plannedAt === targetDate
      );

      const workout = existingWorkout
        ? {
            ...existingWorkout,
            exercises: insertAt(
              existingWorkout.exercises,
              action.payload.index,
              action.payload.exercise
            ),
          }
        : {
            id: v4(),
            name: null,
            note: null,
            traineeId: action.payload.traineeId,
            plannedAt: targetDate,
            exercises: [action.payload.exercise],
          };

      return {
        ...state,
        [action.payload.targetMonthId]: existingWorkout
          ? targetMonth.map((x) => (x.id === workout.id ? workout : x))
          : [...targetMonth, workout],
      };

    case "REMOVE_EXERCISE":
      const month = state[action.payload.monthId] ?? [];

      return {
        ...state,
        [action.payload.monthId]: month.map((x) =>
          x.id === action.payload.plannedWorkoutId
            ? {
                ...x,
                exercises: x.exercises.filter(
                  (y) => y.id !== action.payload.plannedExerciseId
                ),
              }
            : x
        ),
      };

    default:
      return state;
  }
}
