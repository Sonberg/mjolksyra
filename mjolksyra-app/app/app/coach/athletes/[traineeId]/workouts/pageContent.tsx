"use client";

import { CoachWorkspaceShell } from "../../../CoachWorkspaceShell";
import { WorkoutViewer } from "@/components/WorkoutViewer";
import { useQuery } from "@tanstack/react-query";
import { getTrainee } from "@/services/trainees/getTrainee";
import { ChevronLeftIcon, ClipboardCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  traineeId: string;
};

export function PageContent({ traineeId }: Props) {
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
      <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              onClick={() => router.push("/app/coach/athletes")}
              aria-label="Back to athletes"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Workout review
              </p>
              <h1 className="text-xl font-semibold text-zinc-100 md:text-2xl">
                {athleteName}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/app/coach/athletes/${traineeId}/planner`)}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
          >
            <ClipboardCheckIcon className="h-4 w-4" />
            Open planner
          </button>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
        <WorkoutViewer traineeId={traineeId} mode="coach" />
      </section>
    </CoachWorkspaceShell>
  );
}
