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

import { GetPlannedWorkouts } from "@/api/plannedWorkouts/getPlannedWorkout";
import { DeletePlannedWorkout } from "@/api/plannedWorkouts/deletePlannedWorkout";
import { CreatePlannedWorkout } from "@/api/plannedWorkouts/createPlannedWorkout";
import { UpdatePlannedWorkout } from "@/api/plannedWorkouts/updatePlannedWorkout";
import { WorkoutEditor, WorkoutEditorProvider } from "./contexts/WorkoutEditor";
import { PlannedWorkoutActionsProvider } from "./contexts/PlannedWorkoutActions";

type Props = {
  traineeId: string;
  library: ReactNode;
  oneMonthOnly?: boolean;
  plannedWorkouts: {
    update: UpdatePlannedWorkout;
    create: CreatePlannedWorkout;
    delete: DeletePlannedWorkout;
    get: GetPlannedWorkouts;
  };
};

export function WorkoutPlanner({
  oneMonthOnly,
  traineeId,
  plannedWorkouts,
  library,
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
          className="px-4 py-2 h-full flex flex-col gap-8 overflow-y-auto relative will-change-transform"
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
          >
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel
                defaultSize={75}
                minSize={50}
                className="relative border-collapse"
                children={planner}
              />

              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize={25}
                minSize={0}
                maxSize={50}
                className="overflow-visible"
                children={<WorkoutEditor children={library} />}
              />
            </ResizablePanelGroup>
          </PlannerProvider>
        </WorkoutEditorProvider>
      </WorkoutsProvider>
    </PlannedWorkoutActionsProvider>
  );
}
