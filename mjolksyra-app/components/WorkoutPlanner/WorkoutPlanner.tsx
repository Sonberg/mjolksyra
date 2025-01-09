"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ExerciseLibrary } from "../ExerciseLibrary";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { Month } from "./Month";
import dayjs from "dayjs";
import useOnScreen from "@/hooks/useOnScreen";
import { decrementMonth, incrementMonth } from "@/lib/month";
import { TodayButton } from "./TodayButton";

type Month = {
  year: number;
  month: number;
};

type Props = {
  traineeId: string;
};

export function WorkoutPlanner({ traineeId }: Props) {
  const today = useMemo(() => dayjs(), []);
  const [previousHeight, setPreviousHeight] = useState<number | null>(null);
  const [months, setMonths] = useState<Month[]>([
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
    setMonths((state) => {
      return [decrementMonth(state[0]), ...state];
    });
  }, [start.isIntersecting]);

  useEffect(() => {
    if (!end.isIntersecting) {
      return;
    }

    setPreviousHeight(null);
    setMonths((state) => {
      return [...state, incrementMonth(state[state.length - 1])];
    });
  }, [end.isIntersecting]);

  useEffect(() => {
    if (previousHeight === null) {
      return;
    }

    const scrollHeight = containerRef.current!.scrollHeight;
    const scrollTop = scrollHeight - previousHeight;

    containerRef.current!.scroll({ top: scrollTop });
  }, [previousHeight]);

  return useMemo(
    () => (
      <>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={80} minSize={50} className="relative">
            <div
              className="px-4 py-2 h-full flex flex-col gap-8 overflow-y-scroll relative"
              ref={containerRef}
            >
              <div
                className="w-full h-8 text-background"
                ref={start.measureRef}
                children="d"
              />
              {months.map((x) => (
                <Month
                  key={`${x.year}-${x.month}`}
                  traineeId={traineeId}
                  month={x.month}
                  year={x.year}
                />
              ))}

              <div
                className="w-full h-8 text-background"
                ref={end.measureRef}
                children="d"
              />
            </div>
            <TodayButton />
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
    ),
    [start, end, months]
  );
}
