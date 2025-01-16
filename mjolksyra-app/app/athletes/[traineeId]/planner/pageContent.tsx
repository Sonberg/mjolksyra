"use client";

import { WorkoutPlanner } from "@/components/WorkoutPlanner/WorkoutPlanner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

type Props = {
  traineeId: string;
};

export function PageContent({ traineeId }: Props) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WorkoutPlanner traineeId={traineeId} />
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}
