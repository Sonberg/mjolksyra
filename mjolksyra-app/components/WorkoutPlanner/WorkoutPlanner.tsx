"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExerciseLibrary } from "../ExerciseLibrary";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { Month } from "./Month";
import dayjs from "dayjs";
import useOnScreen from "@/lib/hooks/useOnScreen";

type Month = {
  year: number;
  month: number;
};

export function WorkoutPlanner() {
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
      return [
        {
          year: state[0].month === 0 ? state[0].year - 1 : state[0].year,
          month: state[0].month === 0 ? 11 : state[0].month - 1,
        },
        ...state,
      ];
    });
  }, [start.isIntersecting]);

  useEffect(() => {
    if (!end.isIntersecting) {
      return;
    }

    setPreviousHeight(null);
    setMonths((state) => {
      return [
        ...state,
        {
          year:
            state[state.length - 1].month === 11
              ? state[state.length - 1].year + 1
              : state[state.length - 1].year,
          month:
            state[state.length - 1].month === 11
              ? 0
              : state[state.length - 1].month + 1,
        },
      ];
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
  return (
    <>
      <ResizablePanelGroup direction="horizontal" className="">
        <ResizablePanel defaultSize={80} minSize={50}>
          <div
            className="px-4 py-2 h-full flex flex-col gap-8 overflow-y-scroll"
            ref={containerRef}
          >
            <div className="w-full h-8" ref={start.measureRef} />
            {months.map((x) => (
              <Month
                key={`${x.year}-${x.month}`}
                month={x.month}
                year={x.year}
              />
            ))}
            <div className="w-full h-8" ref={end.measureRef} children=" dd" />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={20}
          minSize={0}
          maxSize={30}
          className="overflow-visible"
        >
          <div className="p-4 h-full">
            <ExerciseLibrary />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
