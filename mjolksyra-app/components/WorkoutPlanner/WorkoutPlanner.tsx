"use client";

import { useCallback, useMemo, useRef } from "react";
import { ViewportList, ViewportListRef } from "react-viewport-list";
import dayjs from "dayjs";

import { ExerciseLibrary } from "../ExerciseLibrary";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { Month } from "./Month";
import { TodayButton } from "./TodayButton";
import { useInfinitMonths } from "@/hooks/useInfinitMonths";
import { PlannerProvider } from "./contexts/Planner";
import { WorkoutsProvider } from "./contexts/Workouts";

type Props = {
  traineeId: string;
};

export function WorkoutPlanner({ traineeId }: Props) {
  const listRef = useRef<ViewportListRef | null>(null);
  const today = useMemo(() => dayjs(), []);

  const { months, containerRef, startRef, endRef } = useInfinitMonths();

  const goToToday = useCallback(() => {
    const year = today.year();
    const month = today.month();
    const index = months.findIndex(
      (x) => x.month.year === year && x.month.month === month
    );

    if (index === -1) {
      return;
    }

    listRef.current?.scrollToIndex({ index });
  }, [months, today]);

  const planner = useMemo(
    () => (
      <>
        <div
          className="px-4 py-2 h-full flex flex-col gap-8 overflow-y-scroll relative will-change-transform"
          ref={containerRef}
        >
          <div
            className="w-full h-8 text-background"
            ref={startRef}
            children="d"
          />
          <ViewportList
            viewportRef={containerRef}
            ref={listRef}
            items={months}
            children={(x) => <Month key={x.monthId} value={x} />}
          />

          <div
            className="w-full h-8 text-background"
            ref={endRef}
            children="d"
          />
        </div>
        <TodayButton onClick={goToToday} />
      </>
    ),
    [containerRef, endRef, startRef, goToToday, months]
  );

  return (
    <WorkoutsProvider traineeId={traineeId} months={months}>
      <PlannerProvider traineeId={traineeId}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={80}
            minSize={50}
            className="relative  border-collapse"
            children={planner}
          />

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
      </PlannerProvider>
    </WorkoutsProvider>
  );
}
