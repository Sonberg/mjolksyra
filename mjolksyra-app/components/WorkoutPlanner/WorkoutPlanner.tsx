"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ViewportList, ViewportListRef } from "react-viewport-list";
import dayjs from "dayjs";

import { ExerciseLibrary } from "../ExerciseLibrary";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { Month } from "./Month";
import useOnScreen from "@/hooks/useOnScreen";
import { TodayButton } from "./TodayButton";
import { decrementMonth, incrementMonth } from "@/lib/month";
import { MonthPlannerProvider } from "./contexts/MonthPlanner";

type YearMonth = {
  year: number;
  month: number;
};

type Props = {
  traineeId: string;
};

export function WorkoutPlanner({ traineeId }: Props) {
  const today = useMemo(() => dayjs(), []);
  const [previousHeight, setPreviousHeight] = useState<number | null>(null);
  const [months, setMonths] = useState<YearMonth[]>([
    { year: today.year(), month: today.month() },
  ]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<ViewportListRef | null>(null);
  const start = useOnScreen();
  const end = useOnScreen();

  const goToToday = useCallback(() => {
    const year = today.year();
    const month = today.month();
    const index = months.findIndex((x) => x.year === year && x.month === month);

    if (index === -1) {
      return;
    }

    listRef.current?.scrollToIndex({ index });
  }, [months, today]);

  const renderMonth = useCallback(
    (x: YearMonth) => (
      <MonthPlannerProvider
        key={`${x.year}-${x.month}`}
        traineeId={traineeId}
        month={x.month}
        year={x.year}
        children={<Month />}
      />
    ),
    [traineeId]
  );

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

  return (
    <>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={80} minSize={50} className="relative">
          <div
            className="px-4 py-2 h-full flex flex-col gap-8 overflow-y-scroll relative will-change-transform"
            ref={containerRef}
          >
            <div
              className="w-full h-8 text-background"
              ref={start.measureRef}
              children="d"
            />
            <ViewportList
              viewportRef={containerRef}
              ref={listRef}
              items={months}
              children={renderMonth}
            />

            <div
              className="w-full h-8 text-background"
              ref={end.measureRef}
              children="d"
            />
          </div>
          <TodayButton onClick={goToToday} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={20}
          minSize={0}
          maxSize={30}
          className="overflow-visible"
        >
          <ExerciseLibrary />
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
