import { create } from "zustand";
import { PlannedWorkout } from "@/api/plannedWorkouts/type";
import { CreatePlannedWorkout } from "@/api/plannedWorkouts/createPlannedWorkout";
import { UpdatePlannedWorkout } from "@/api/plannedWorkouts/updatePlannedWorkout";
import { DeletePlannedWorkout } from "@/api/plannedWorkouts/deletePlannedWorkout";
import { v4 } from "uuid";

type WorkoutStoreState = {
  data: PlannedWorkout[];
  create: CreatePlannedWorkout;
  update: UpdatePlannedWorkout;
  delete: DeletePlannedWorkout;
};

export const useWorkoutStore = create<WorkoutStoreState>((set) => ({
  data: [],
  update: async ({ plannedWorkout }) => {
    set((state) => ({
      ...state,
      data: state.data.map((x) =>
        x.id === plannedWorkout.id ? plannedWorkout : x
      ),
    }));

    return plannedWorkout;
  },
  create: async ({ plannedWorkout }) => {
    const newWorkout = {
      ...plannedWorkout,
      id: v4(),
      createdAt: new Date(),
    };

    set((state) => {
      return {
        ...state,
        data: [...state.data, newWorkout],
      };
    });

    return newWorkout;
  },
  delete: async ({ plannedWorkout }) => {
    set((state) => ({
      ...state,
      data: state.data.filter((x) => x.id !== plannedWorkout.id),
    }));
  },
}));
