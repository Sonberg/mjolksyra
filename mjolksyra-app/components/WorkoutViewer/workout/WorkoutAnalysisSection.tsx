"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { analyzeWorkoutMedia } from "@/services/plannedWorkouts/analyzeWorkoutMedia";
import { getLatestWorkoutMediaAnalysis } from "@/services/plannedWorkouts/getLatestWorkoutMediaAnalysis";

type Props = {
  traineeId: string;
  plannedWorkoutId: string;
};

export function WorkoutAnalysisSection({ traineeId, plannedWorkoutId }: Props) {
  const queryClient = useQueryClient();
  const [context, setContext] = useState("");

  const latestAnalysis = useQuery({
    queryKey: ["planned-workout-analysis", traineeId, plannedWorkoutId],
    queryFn: ({ signal }) =>
      getLatestWorkoutMediaAnalysis({
        traineeId,
        plannedWorkoutId,
        signal,
      }),
  });

  const analyze = useMutation({
    mutationFn: async () =>
      analyzeWorkoutMedia({
        traineeId,
        plannedWorkoutId,
        analysis: {
          text: context,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["planned-workout-analysis", traineeId, plannedWorkoutId],
      });
    },
  });

  const canAnalyze = useMemo(() => {
    return !analyze.isPending;
  }, [analyze.isPending]);

  const analysis = analyze.data ?? latestAnalysis.data;

  return (
    <section
      className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)]"
      data-testid="workout-analysis-section"
    >
      <div className="border-b border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-3">
        <p className="text-sm font-semibold text-[var(--shell-ink)]">Workout analysis</p>
        <p className="text-[11px] font-medium text-[var(--shell-muted)]">
          Media is fetched from workout chat attachments.
        </p>
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        <div className="border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-1.5">
          <textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            rows={2}
            placeholder="Optional context for analysis..."
            data-testid="workout-analysis-context"
            className="w-full resize-none border-0 bg-transparent text-sm leading-5 text-[var(--shell-ink)] outline-none placeholder:text-[var(--shell-muted)]"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-[var(--shell-muted)]">Always uses latest chat media.</p>
          <button
            type="button"
            disabled={!canAnalyze}
            onClick={() => analyze.mutate()}
            className="min-h-10 shrink-0 border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 text-[11px] font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:opacity-60"
          >
            {analyze.isPending ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {analyze.isPending ? (
          <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-xs font-medium text-[var(--shell-muted)]">
            Analyzing workout notes and media...
          </div>
        ) : null}

        {analyze.isError ? (
          <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-xs font-medium text-red-500">
            Could not analyze this check-in right now.
          </div>
        ) : null}

        {latestAnalysis.isError && !analyze.data ? (
          <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-xs font-medium text-red-500">
            Could not load previous analysis.
          </div>
        ) : null}

        {analysis ? (
          <article
            className="rounded-2xl border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-3"
            data-testid="workout-analysis-outcome"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
              AI analysis
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--shell-ink)]">{analysis.summary}</p>
            <p className="mt-1 text-[11px] text-[var(--shell-muted)]" data-testid="workout-analysis-timestamp">
              Last analyzed {new Date(analysis.createdAt).toLocaleString()}
            </p>
            {analysis.keyFindings.length > 0 ? (
              <p className="mt-2 text-xs text-[var(--shell-muted)]">
                Findings: {analysis.keyFindings.join("; ")}
              </p>
            ) : null}
            {analysis.techniqueRisks.length > 0 ? (
              <p className="mt-1 text-xs text-[var(--shell-muted)]">
                Risks: {analysis.techniqueRisks.join("; ")}
              </p>
            ) : null}
            {analysis.coachSuggestions.length > 0 ? (
              <p className="mt-1 text-xs text-[var(--shell-muted)]">
                Suggestions: {analysis.coachSuggestions.join("; ")}
              </p>
            ) : null}
          </article>
        ) : null}
      </div>
    </section>
  );
}
