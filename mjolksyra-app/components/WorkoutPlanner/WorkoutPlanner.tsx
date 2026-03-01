"use client";

import { ReactNode, useCallback, useMemo, useRef } from "react";
import { ViewportList, ViewportListRef } from "react-viewport-list";
import dayjs from "dayjs";

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

import { GetPlannedWorkouts } from "@/services/plannedWorkouts/getPlannedWorkout";
import { DeletePlannedWorkout } from "@/services/plannedWorkouts/deletePlannedWorkout";
import { CreatePlannedWorkout } from "@/services/plannedWorkouts/createPlannedWorkout";
import { UpdatePlannedWorkout } from "@/services/plannedWorkouts/updatePlannedWorkout";
import { WorkoutEditor, WorkoutEditorProvider } from "./contexts/WorkoutEditor";
import { PlannedWorkoutActionsProvider } from "./contexts/PlannedWorkoutActions";
import { ApplyBlock } from "@/services/blocks/applyBlock";

type Props = {
  traineeId: string;
  rightSide: ReactNode;
  oneMonthOnly?: boolean;
  plannedWorkouts: {
    update: UpdatePlannedWorkout;
    create: CreatePlannedWorkout;
    delete: DeletePlannedWorkout;
    get: GetPlannedWorkouts;
  };
  blocks?: {
    apply: ApplyBlock;
  };
};

export function WorkoutPlanner({
  oneMonthOnly,
  traineeId,
  plannedWorkouts,
  rightSide,
  blocks,
}: Props) {
  const listRef = useRef<ViewportListRef | null>(null);
  const today = useMemo(() => dayjs(), []);

  const { months, containerRef, startRef, endRef } = useInfinitMonths({
    oneMonthOnly,
  });

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
          className="relative h-full overflow-y-auto overscroll-contain px-4 py-0 will-change-transform"
          ref={containerRef}
        >
          {oneMonthOnly ? null : (
            <div
              className="w-full h-8 text-background"
              ref={startRef}
              children="d"
            />
          )}
          <ViewportList
            viewportRef={containerRef}
            ref={listRef}
            items={months}
            children={(x) => <Month key={x.monthId} value={x} />}
          />

          {oneMonthOnly ? null : (
            <div
              className="w-full h-8 text-background"
              ref={endRef}
              children="d"
            />
          )}
        </div>
        <TodayButton onClick={goToToday} />
      </>
    ),
    [containerRef, oneMonthOnly, startRef, months, endRef, goToToday]
  );

  return (
    <PlannedWorkoutActionsProvider value={plannedWorkouts}>
      <WorkoutsProvider traineeId={traineeId} months={months}>
        <WorkoutEditorProvider>
          <PlannerProvider
            traineeId={traineeId}
            plannedWorkouts={plannedWorkouts}
            applyBlock={blocks?.apply}
          >
            <ResizablePanelGroup direction="horizontal" className="h-full min-h-0">
              <ResizablePanel
                defaultSize={75}
                minSize={50}
                className="relative min-h-0 overflow-hidden border-collapse"
                children={planner}
              />

              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize={25}
                minSize={0}
                maxSize={50}
                className="min-h-0 overflow-hidden"
                children={<WorkoutEditor children={rightSide} />}
              />
            </ResizablePanelGroup>
          </PlannerProvider>
        </WorkoutEditorProvider>
      </WorkoutsProvider>
    </PlannedWorkoutActionsProvider>
  );
}
