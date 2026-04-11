"use client";

import { CoachWorkspaceShell } from "../../../CoachWorkspaceShell";
import { WorkoutViewer } from "@/components/WorkoutViewer";
import { useQuery } from "@tanstack/react-query";
import { getTrainee } from "@/services/trainees/getTrainee";
import { ChevronLeftIcon, ClipboardCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";

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
          <button
            type="button"
            className="inline-flex items-center text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]"
            onClick={() => router.push("/app/coach/athletes")}
            aria-label="Back to athletes"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        }
        actions={
          <button
            type="button"
            onClick={() =>
              router.push(`/app/coach/athletes/${traineeId}/planner`)
            }
            className="inline-flex items-center gap-2 rounded-none border border-[var(--shell-border)] bg-[var(--shell-ink)] px-4 py-2 text-sm font-semibold text-[var(--shell-surface)] transition hover:brightness-95"
          >
            <ClipboardCheckIcon className="h-4 w-4" />
            Planner
          </button>
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
