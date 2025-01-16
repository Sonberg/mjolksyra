import { createContext, useContext, useEffect, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";

import { getPlannedWorkouts } from "@/api/plannedWorkouts/getPlannedWorkout";
import { MonthValue } from "@/hooks/useInfinitMonths";
import { Action, MonthWorkouts, workoutsReducer } from "./workoutsReducer";

type Args = {
  traineeId: string;
  months: MonthValue[];
  children: ReactNode;
};

type ContextValue = {
  data: MonthWorkouts;
  dispatch: Dispatch<Action>;
};

const Context = createContext<ContextValue>({
  data: {},
  dispatch() {},
});

export const useWorkouts = () => useContext(Context);

export function WorkoutsProvider({ traineeId, months, children }: Args) {
  const [data, dispatch] = useReducer(workoutsReducer, {});

  useEffect(() => {
    if (typeof window === undefined) {
      return;
    }

    const controller = new AbortController();
    const fetched = Object.keys(data);

    const tasks = months
      .filter((x) => !fetched.includes(x.monthId))
      .map((x) =>
        getPlannedWorkouts({
          traineeId,
          fromDate: x.startOfMonth,
          toDate: x.endOfMonth,
          limit: 32,
          signal: controller.signal,
        }).then((res) =>
          dispatch({
            type: "SET_MONTH",
            payload: { monthId: x.monthId, workouts: res.data },
          })
        )
      );

    Promise.all(tasks).then(() => console.log("Done"));

    return () => {
      controller.abort();
    };
  }, [months, data, traineeId]);

  return (
    <Context.Provider
      children={children}
      value={{
        data,
        dispatch,
      }}
    />
  );
}
