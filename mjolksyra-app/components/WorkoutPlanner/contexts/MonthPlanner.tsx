// import dayjs from "dayjs";
// import { createContext, ReactNode, use, useMemo } from "react";
// import { useMutation, useQuery } from "@tanstack/react-query";

// import { getPlannedWorkouts } from "@/api/plannedWorkouts/getPlannedWorkout";
// import { PlannedWorkout } from "@/api/plannedWorkouts/type";
// import { updatePlannedWorkout } from "@/api/plannedWorkouts/updatePlannedWorkout";
// import { MonthValue } from "@/hooks/useInfinitMonths";

// type Args = {
//   traineeId: string;
//   value: MonthValue;
//   children: ReactNode;
// };

// type MonthPlannerContextValue = {
//   startOfMonth: dayjs.Dayjs;
//   endOfMonth: dayjs.Dayjs;
//   days: dayjs.Dayjs[];
//   workouts: PlannedWorkout[];
//   isFetched: boolean;
//   update: (_: PlannedWorkout) => void;
// };

// const MonthPlannerContext = createContext<MonthPlannerContextValue>({
//   startOfMonth: dayjs(),
//   endOfMonth: dayjs(),
//   days: [],
//   workouts: [],
//   isFetched: false,
//   update: () => null,
// });

// export const useMonthPlanner = () => use(MonthPlannerContext);

// export function MonthPlannerProvider({ traineeId, value, children }: Args) {
//   const workouts = useQuery({
//     queryKey: ["workouts", value.month.year, value.month.month],
//     queryFn: async ({ signal }) => {
//       return {
//         data: [],
//         next: null,
//       };
//       // await getPlannedWorkouts({
//       //   traineeId,
//       //   signal,
//       //   fromDate: value.startOfMonth,
//       //   toDate: value.endOfMonth,
//       //   limit: 31,
//       // });
//     },
//     placeholderData: {
//       data: [],
//       next: null,
//     },
//   });

//   const update = useMutation({
//     mutationKey: ["workouts", value.month.year, value.month.month, "update"],
//     mutationFn: async (plannedWorkout: PlannedWorkout) => {
//       return await updatePlannedWorkout({ plannedWorkout });
//     },
//     onSettled: () => workouts.refetch(),
//   });

//   const contextValue = useMemo(
//     () => ({
//       days: value.days,
//       startOfMonth: value.startOfMonth,
//       endOfMonth: value.endOfMonth,
//       isFetched: workouts.isFetched,
//       workouts: workouts.data?.data ?? [],
//       update: update.mutateAsync,
//     }),
//     [
//       value.days,
//       value.startOfMonth,
//       value.endOfMonth,
//       workouts.isFetched,
//       workouts.data?.data,
//       update.mutateAsync,
//     ]
//   );

//   return (
//     <MonthPlannerContext.Provider value={contextValue} children={children} />
//   );
// }
