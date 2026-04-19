"use client";

import { CoachWorkspaceShell } from "../../../CoachWorkspaceShell";
import { WorkoutViewer } from "@/components/WorkoutViewer";
import { useQuery } from "@tanstack/react-query";
import { getTrainee } from "@/services/trainees/getTrainee";
import { ChevronLeftIcon, ClipboardCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import { Button } from "@/components/ui/button";

type Props = {
  traineeId: string;
  initialTab?: "planned" | "completed";
};

export function PageContent({ traineeId, initialTab }: Props) {
  const router = useRouter();
  const { data: trainee } = useQuery({
    queryKey: ["trainees", traineeId, "workoutReviewHeader"],
    queryFn: ({ signal }) => getTrainee({ id: traineeId, signal }),
  });

  const athleteName =
    trainee?.athlete?.givenName || trainee?.athlete?.familyName
      ? `${trainee?.athlete?.givenName ?? ""} ${trainee?.athlete?.familyName ?? ""}`.trim()
      : trainee?.athlete?.name || "Athlete";

  return (
    <CoachWorkspaceShell>
      <PageSectionHeader
        eyebrow="Workouts"
        title={athleteName}
        titleClassName="text-xl md:text-2xl"
        leading={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-none text-[var(--shell-muted)]"
            onClick={() => router.push("/app/coach/athletes")}
            aria-label="Back to athletes"
          >
            <ChevronLeftIcon data-icon />
          </Button>
        }
        actions={
          <Button
            type="button"
            onClick={() =>
              router.push(`/app/coach/athletes/${traineeId}/planner`)
            }
          >
            <ClipboardCheckIcon data-icon="inline-start" />
            Planner
          </Button>
        }
      />

      <WorkoutViewer
        traineeId={traineeId}
        mode="coach"
        initialTab={initialTab}
      />
    </CoachWorkspaceShell>
  );
}
