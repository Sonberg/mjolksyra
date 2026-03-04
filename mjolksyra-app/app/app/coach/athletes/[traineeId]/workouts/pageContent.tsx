"use client";

import { CoachWorkspaceShell } from "../../../CoachWorkspaceShell";
import { WorkoutViewer } from "@/components/WorkoutViewer";
import { useQuery } from "@tanstack/react-query";
import { getTrainee } from "@/services/trainees/getTrainee";
import { ChevronLeftIcon, ClipboardCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  traineeId: string;
  initialTab?: "past" | "future" | "changes";
  focusWorkoutId?: string | null;
};

export function PageContent({ traineeId, initialTab, focusWorkoutId }: Props) {
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
      <section className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface)] hover:text-[var(--shell-ink)]"
              onClick={() => router.push("/app/coach/athletes")}
              aria-label="Back to athletes"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
                Workout review
              </p>
              <h1 className="text-xl font-semibold text-[var(--shell-ink)] md:text-2xl">
                {athleteName}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/app/coach/athletes/${traineeId}/planner`)}
            className="inline-flex items-center gap-2 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-ink)] px-4 py-2 text-sm font-semibold text-[var(--shell-surface)] transition hover:bg-[var(--shell-ink-soft)]"
          >
            <ClipboardCheckIcon className="h-4 w-4" />
            Open planner
          </button>
        </div>
      </section>

      <section className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5 md:p-6">
        <WorkoutViewer
          traineeId={traineeId}
          mode="coach"
          initialTab={initialTab}
          focusWorkoutId={focusWorkoutId}
        />
      </section>
    </CoachWorkspaceShell>
  );
}
