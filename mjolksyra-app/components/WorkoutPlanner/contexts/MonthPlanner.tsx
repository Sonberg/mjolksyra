import dayjs from "dayjs";
import { createContext, ReactNode, use, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { getPlannedWorkouts } from "@/api/plannedWorkouts/getPlannedWorkout";
import { PlannedWorkout } from "@/api/plannedWorkouts/type";
import { updatePlannedWorkout } from "@/api/plannedWorkouts/updatePlannedWorkout";

type Args = {
  traineeId: string;
  year: number;
  month: number;
  children: ReactNode;
};

type MonthPlannerContextValue = {
  startOfMonth: dayjs.Dayjs;
  endOfMonth: dayjs.Dayjs;
  workouts: PlannedWorkout[];
  isFetched: boolean;
  update: (_: PlannedWorkout) => void;
};

const MonthPlannerContext = createContext<MonthPlannerContextValue>({
  startOfMonth: dayjs(),
  endOfMonth: dayjs(),
  workouts: [],
  isFetched: false,
  update: () => null,
});

export const useMonthPlanner = () => use(MonthPlannerContext);

export function MonthPlannerProvider({
  traineeId,
  year,
  month,
  children,
}: Args) {
  const startOfMonth = useMemo(
    () => dayjs().date(1).year(year).month(month).startOf("month"),
    [month, year]
  );

  const endOfMonth = useMemo(() => startOfMonth.endOf("month"), [startOfMonth]);

  const workouts = useQuery({
    queryKey: ["workouts", year, month],
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
    mutationKey: ["workouts", year, month, "update"],
    mutationFn: async (plannedWorkout: PlannedWorkout) => {
      return await updatePlannedWorkout({ plannedWorkout });
    },
  });

  const value = useMemo(
    () => ({
      startOfMonth,
      endOfMonth,
      isFetched: workouts.isFetched,
      workouts: workouts.data ?? [],
      update: update.mutateAsync,
    }),
    [startOfMonth, endOfMonth, workouts, update]
  );

  return <MonthPlannerContext.Provider value={value} children={children} />;
}
