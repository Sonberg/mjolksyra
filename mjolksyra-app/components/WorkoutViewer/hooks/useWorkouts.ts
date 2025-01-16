import { getPlannedWorkouts } from "@/api/plannedWorkouts/getPlannedWorkout";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

type Args = {
  traineeId: string;
  fromDate: dayjs.Dayjs;
  toDate: dayjs.Dayjs;
  sortBy: string;
  order: "asc" | "desc";
};

export function useWorkouts({ traineeId, fromDate, toDate, ...args }: Args) {
  const { isFetched, data } = useQuery({
    queryKey: ["workouts", fromDate.year(), fromDate.month()],
    queryFn: async ({ signal }) => {
      return await getPlannedWorkouts({
        traineeId,
        fromDate,
        toDate,
        signal,
        limit: 32,
        ...args,
      });
    },
    placeholderData: {
      data: [],
      next: null,
    },
  });

  return {
    isFetched: isFetched,
    data: data?.data ?? [],
  };
}
