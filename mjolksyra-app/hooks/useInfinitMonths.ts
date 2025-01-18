import dayjs from "dayjs";
import { useMemo, useState, useRef, useEffect } from "react";
import { decrementMonth, incrementMonth } from "@/lib/month";
import useOnScreen from "./useOnScreen";
import { getDatesBetween } from "@/lib/getDatesBetween";
import { PLANNED_AT } from "@/constants/dateFormats";

export type YearMonth = {
  year: number;
  month: number;
};

export type MonthValue = {
  month: YearMonth;
  monthId: string;
  startOfMonth: dayjs.Dayjs;
  endOfMonth: dayjs.Dayjs;
  days: dayjs.Dayjs[];
  ids: string[];
};

function getMonth(month: YearMonth): MonthValue {
  const startOfMonth = dayjs()
    .date(1)
    .year(month.year)
    .month(month.month)
    .startOf("month");

  const endOfMonth = startOfMonth.endOf("month");
  const days = getDatesBetween(startOfMonth, endOfMonth);

  return {
    month,
    monthId: `${month.year}-${month.month}`,
    startOfMonth,
    endOfMonth,
    days,
    ids: days.map((x) => x.format(PLANNED_AT)),
  };
}

type Args = {
  oneMonthOnly?: boolean;
};

export function useInfinitMonths({ oneMonthOnly }: Args) {
  const today = useMemo(() => dayjs(), []);
  const [previousHeight, setPreviousHeight] = useState<number | null>(null);
  const [months, setMonths] = useState<MonthValue[]>(() => {
    return [getMonth({ year: today.year(), month: today.month() })];
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const start = useOnScreen();
  const end = useOnScreen();

  useEffect(() => {
    if (!start.isIntersecting) {
      return;
    }

    if (oneMonthOnly) {
      return;
    }

    setPreviousHeight(containerRef.current?.scrollHeight ?? null);
    setMonths((state) => [getMonth(decrementMonth(state[0].month)), ...state]);
  }, [start.isIntersecting, oneMonthOnly]);

  useEffect(() => {
    if (!end.isIntersecting) {
      return;
    }

    if (oneMonthOnly) {
      return;
    }

    setPreviousHeight(null);
    setMonths((state) => [
      ...state,
      getMonth(incrementMonth(state[state.length - 1].month)),
    ]);
  }, [end.isIntersecting, oneMonthOnly]);

  useEffect(() => {
    if (previousHeight === null) {
      return;
    }

    const scrollHeight = containerRef.current!.scrollHeight;
    const scrollTop = scrollHeight - previousHeight;

    containerRef.current!.scroll({ top: scrollTop });
  }, [previousHeight]);

  return {
    months,
    containerRef,
    startRef: start.measureRef,
    endRef: end.measureRef,
  };
}
