"use client";

import { WorkoutViewer } from "@/components/WorkoutViewer";

type Props = {
  traineeId: string;
  initialTab?: "past" | "future";
  focusWorkoutId?: string | null;
};

export function PageContent({ traineeId, initialTab, focusWorkoutId }: Props) {
  return (
    <WorkoutViewer
      traineeId={traineeId}
      initialTab={initialTab}
      focusWorkoutId={focusWorkoutId}
    />
  );
}
