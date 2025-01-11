"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WorkoutViewer } from "@/components/WorkoutViewer";

const queryClient = new QueryClient();

type Props = {
  traineeId: string;
};

export function PageContent({ traineeId }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkoutViewer traineeId={traineeId} />
    </QueryClientProvider>
  );
}
