import { CreatePlannedWorkout } from "@/api/plannedWorkouts/createPlannedWorkout";
import { DeletePlannedWorkout } from "@/api/plannedWorkouts/deletePlannedWorkout";
import { GetPlannedWorkouts } from "@/api/plannedWorkouts/getPlannedWorkout";
import { UpdatePlannedWorkout } from "@/api/plannedWorkouts/updatePlannedWorkout";
import { createContext, ReactNode, useContext } from "react";

type PlannedWorkoutActionsContextValue = {
  update: UpdatePlannedWorkout;
  create: CreatePlannedWorkout;
  delete: DeletePlannedWorkout;
  get: GetPlannedWorkouts;
};

const PlannedWorkoutActionsContext =
  createContext<PlannedWorkoutActionsContextValue>({
    update: undefined!,
    create: undefined!,
    delete: undefined!,
    get: undefined!,
  });

type Props = {
  children: ReactNode;
  value: PlannedWorkoutActionsContextValue;
};

export function usePlannedWorkoutActions() {
  return useContext(PlannedWorkoutActionsContext);
}

export function PlannedWorkoutActionsProvider({ children, value }: Props) {
  return (
    <PlannedWorkoutActionsContext.Provider value={value} children={children} />
  );
}
