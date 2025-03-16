"use client";

import { WorkoutViewer } from "@/components/WorkoutViewer";

type Props = {
  traineeId: string;
};

export function PageContent({ traineeId }: Props) {
  return <WorkoutViewer traineeId={traineeId} />;
}
