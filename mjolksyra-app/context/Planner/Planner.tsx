import { getPlannedWorkouts } from "@/api/plannedWorkouts/getPlannedWorkout";
import { PlannedWorkout } from "@/api/plannedWorkouts/type";
import { flatten } from "@/lib/flatten";
import { decrementMonth, incrementMonth } from "@/lib/month";
import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  createContext,
  ReactNode,
  use,
  useCallback,
  useMemo,
  useState,
} from "react";

type Month = {
  year: number;
  month: number;
};

type Args = {
  traineeId: string;
  children: ReactNode;
};

type ContextValue = {
  months: Month[];
  workouts: PlannedWorkout[];
  next: () => void;
  previous: () => void;
};

const Context = createContext<ContextValue>({
  months: [],
  workouts: [],
  next: () => null,
  previous: () => null,
});

export const usePlanner = () => use(Context);

export function PlannerProvider({ traineeId, children }: Args) {
  const today = useMemo(() => dayjs(), []);

  const [months, setMonths] = useState([
    { year: today.year(), month: today.month() },
  ]);

  const { data, fetchNextPage, fetchPreviousPage } = useInfiniteQuery({
    queryKey: ["workouts"],
    queryFn: async ({ pageParam, meta }) => {
      console.log(meta);

      const startOfMonth = dayjs()
        .date(1)
        .year(pageParam.year)
        .month(pageParam.month)
        .startOf("month");

      const endOfMonth = startOfMonth.endOf("month");

      return await getPlannedWorkouts({
        traineeId,
        fromDate: startOfMonth,
        toDate: endOfMonth,
      });
    },
    initialPageParam: { year: today.year(), month: today.month() },
    getNextPageParam: (_1, _2, last) => incrementMonth(last),
    getPreviousPageParam: (_1, _2, last) => decrementMonth(last),
    initialData: {
      pageParams: [],
      pages: [],
    },
  });

  const next = useCallback(() => {
    setMonths((state) => [...state, incrementMonth(state[state.length - 1])]);

    fetchNextPage();
  }, []);

  const previous = useCallback(() => {
    setMonths((state) => [decrementMonth(state[0]), ...state]);
    fetchPreviousPage();
  }, []);

  const value = useMemo(
    () => ({
      months,
      workouts: flatten(data.pages, (x) => x),
      next,
      previous,
    }),
    [data, months, next, previous]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
