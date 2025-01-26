import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import type { Dispatch, ReactNode } from "react";

import { MonthValue } from "@/hooks/useInfinitMonths";
import { Action, MonthWorkouts, workoutsReducer } from "./workoutsReducer";
import { usePlannedWorkoutActions } from "../PlannedWorkoutActions";

type Args = {
  traineeId: string;
  months: MonthValue[];
  children: ReactNode;
};

type ContextValue = {
  data: MonthWorkouts;
  dispatch: Dispatch<Action>;
  reload: (monthId: string) => Promise<void>;
};

const Context = createContext<ContextValue>({
  data: {},
  dispatch() {},
  reload: async () => {},
});

export const useWorkouts = () => useContext(Context);

export function WorkoutsProvider({ traineeId, months, children }: Args) {
  const [data, dispatch] = useReducer(workoutsReducer, {});
  const { get } = usePlannedWorkoutActions();
  const reload = useCallback(
    async (monthId: string | MonthValue, signal?: AbortSignal) => {
      const month =
        typeof monthId === "string"
          ? months.find((x) => x.monthId == monthId)
          : monthId;

      if (!month) {
        return;
      }

      console.log("reloading ", month.monthId);

      const { data } = await get({
        traineeId,
        fromDate: month.startOfMonth,
        toDate: month.endOfMonth,
        limit: 32,
        signal,
      });

      dispatch({
        type: "SET_MONTH",
        payload: { monthId: month.monthId, workouts: data },
      });
    },
    [months, get, traineeId]
  );

  useEffect(() => {
    if (typeof window === undefined) {
      return;
    }

    const controller = new AbortController();
    const fetched = Object.keys(data);

    const tasks = months
      .filter((x) => !fetched.includes(x.monthId))
      .map((x) => reload(x, controller.signal));

    Promise.all(tasks);

    return () => {
      controller?.abort();
    };
  }, [months, data, traineeId, reload]);

  return (
    <Context.Provider
      children={children}
      value={{
        data,
        dispatch,
        reload: (monthId: string) => reload(monthId),
      }}
    />
  );
}
