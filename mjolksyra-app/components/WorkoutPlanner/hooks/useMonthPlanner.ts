import { getPlannedWorkouts } from "@/api/plannedWorkouts/getPlannedWorkout";
import { PlannedExercise, PlannedWorkout } from "@/api/plannedWorkouts/type";
import { updatePlannedWorkout } from "@/api/plannedWorkouts/updatePlannedWorkout";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";

type Args = {
  traineeId: string;
  startOfMonth: dayjs.Dayjs;
  endOfMonth: dayjs.Dayjs;
  isVisible: boolean;
};

export function useMonthPlanner({ traineeId, startOfMonth, endOfMonth }: Args) {
  const key = useMemo(
    () => ["workouts", startOfMonth.year(), startOfMonth.month()],
    [startOfMonth]
  );

  const workouts = useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => {
      return await getPlannedWorkouts({
        traineeId,
        signal,
        fromDate: startOfMonth,
        toDate: endOfMonth,
      });
    },
    placeholderData: [],
  });

  const update = useMutation({
    mutationKey: ["workouts", "update"],
    mutationFn: async (plannedWorkout: PlannedWorkout) => {
      return await updatePlannedWorkout({ plannedWorkout });
    },
  });

  return useMemo(
    () => ({
      workouts: workouts.data ?? [],
      updateWorkout: update.mutateAsync,
    }),
    [workouts.data, update.mutateAsync]
  );
}
