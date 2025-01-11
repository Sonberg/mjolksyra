import dayjs from "dayjs";
import { useMemo, useState, useRef, useEffect } from "react";
import { decrementMonth, incrementMonth } from "@/lib/month";
import useOnScreen from "./useOnScreen";

type YearMonth = {
  year: number;
  month: number;
};

export function useInfinitMonths() {
  const today = useMemo(() => dayjs(), []);
  const [previousHeight, setPreviousHeight] = useState<number | null>(null);
  const [months, setMonths] = useState<YearMonth[]>([
    { year: today.year(), month: today.month() },
  ]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const start = useOnScreen();
  const end = useOnScreen();

  useEffect(() => {
    if (!start.isIntersecting) {
      return;
    }

    setPreviousHeight(containerRef.current?.scrollHeight ?? null);
    setMonths((state) => [decrementMonth(state[0]), ...state]);
  }, [start.isIntersecting]);

  useEffect(() => {
    if (!end.isIntersecting) {
      return;
    }

    setPreviousHeight(null);
    setMonths((state) => [...state, incrementMonth(state[state.length - 1])]);
  }, [end.isIntersecting]);

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
