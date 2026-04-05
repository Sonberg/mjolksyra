import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import type { Dispatch, ReactNode } from "react";

import { MonthValue } from "@/hooks/useInfinitMonths";
import { Action, MonthWorkouts, workoutsReducer } from "./workoutsReducer";
import { usePlannedWorkoutActions } from "../PlannedWorkoutActions";
import { useUserEvents } from "@/context/UserEvents/UserEvents";

type Args = {
  traineeId: string;
  months: MonthValue[];
  children: ReactNode;
};

type ContextValue = {
  traineeId: string;
  data: MonthWorkouts;
  dispatch: Dispatch<Action>;
  reload: (monthId: string) => Promise<void>;
};

const Context = createContext<ContextValue>({
  traineeId: "",
  data: {},
  dispatch() {},
  reload: async () => {},
});

export const useWorkouts = () => useContext(Context);

export function WorkoutsProvider({ traineeId, months, children }: Args) {
  const [data, dispatch] = useReducer(workoutsReducer, {});
  const { get } = usePlannedWorkoutActions();
  const { subscribe } = useUserEvents();
  const monthsRef = useRef(months);
  monthsRef.current = months;

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

      try {
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
      } catch (err) {
        if (!axios.isCancel(err)) throw err;
      }
    },
    [months, get, traineeId]
  );

  const reloadAll = useCallback(() => {
    const fetched = Object.keys(data);
    const tasks = monthsRef.current
      .filter((x) => fetched.includes(x.monthId))
      .map((x) => reload(x));
    void Promise.all(tasks);
  }, [data, reload]);

  useEffect(() => {
    return subscribe("planned-workouts.updated", (payload) => {
      const p = payload as { traineeId?: string } | undefined;
      if (p?.traineeId === traineeId) {
        reloadAll();
      }
    });
  }, [subscribe, traineeId, reloadAll]);

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
        traineeId,
        data,
        dispatch,
        reload: (monthId: string) => reload(monthId),
      }}
    />
  );
}
