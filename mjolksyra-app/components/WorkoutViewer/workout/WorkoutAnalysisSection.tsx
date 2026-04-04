import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { getCreditPricing } from "@/services/coaches/getCreditPricing";
import { analyzeWorkoutMedia } from "@/services/plannedWorkouts/analyzeWorkoutMedia";
import { getLatestWorkoutMediaAnalysis } from "@/services/plannedWorkouts/getLatestWorkoutMediaAnalysis";

type Props = {
  traineeId: string;
  plannedWorkoutId: string;
};

export function WorkoutAnalysisTrigger({ traineeId, plannedWorkoutId }: Props) {
  const queryClient = useQueryClient();
  const [context, setContext] = useState("");

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

  const pricing = useQuery({
    queryKey: ["coach-credit-pricing"],
    queryFn: getCreditPricing,
  });

  const canAnalyze = useMemo(() => {
    return !analyze.isPending;
  }, [analyze.isPending]);

  const analyzeCost = useMemo(() => {
    const mediaAction = pricing.data?.find((item) => item.action === "AnalyzeWorkoutMedia");
    return mediaAction?.creditCost ?? null;
  }, [pricing.data]);
  const analysisErrorMessage = useMemo(() => {
    if (!analyze.isError) {
      return null;
    }

    if (analyze.error instanceof AxiosError && analyze.error.response?.status === 422) {
      const errorMessage =
        typeof analyze.error.response.data === "object" && analyze.error.response.data !== null
          ? (analyze.error.response.data as { error?: string }).error
          : null;

      return errorMessage ?? "Not enough credits to analyze this check-in.";
    }

    return "Could not analyze this check-in right now.";
  }, [analyze.error, analyze.isError]);

  return (
    <section className="space-y-3" data-testid="workout-analysis-section">
      <textarea
        value={context}
        onChange={(event) => setContext(event.target.value)}
        rows={2}
        placeholder="Optional context for analysis..."
        data-testid="workout-analysis-context"
        className="w-full resize-none border-b border-[var(--shell-border)] bg-transparent py-1.5 text-sm leading-5 text-[var(--shell-ink)] outline-none placeholder:text-[var(--shell-muted)]"
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--shell-muted)]">
          Uses latest chat media.{analyzeCost ? ` ${analyzeCost} credits.` : ""}
        </p>
        <button
          type="button"
          disabled={!canAnalyze}
          onClick={() => analyze.mutate()}
          className="shrink-0 border border-transparent bg-[var(--shell-accent)] px-3 py-1.5 text-[11px] font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
        >
          {analyze.isPending ? "Analyzing..." : analyzeCost ? `Analyze (${analyzeCost} credits)` : "Analyze"}
        </button>
      </div>

      {analyze.isPending ? (
        <p className="text-xs text-[var(--shell-muted)]">Analyzing workout notes and media...</p>
      ) : null}

      {analyze.isError ? (
        <p className="text-xs text-red-500">{analysisErrorMessage}</p>
      ) : null}
    </section>
  );
}

export function WorkoutAnalysisSection({ traineeId, plannedWorkoutId }: Props) {
  const latestAnalysis = useQuery({
    queryKey: ["planned-workout-analysis", traineeId, plannedWorkoutId],
    queryFn: ({ signal }) =>
      getLatestWorkoutMediaAnalysis({
        traineeId,
        plannedWorkoutId,
        signal,
      }),
  });

  const analysis = latestAnalysis.data;

  return (
    <>
      {latestAnalysis.isError && !analysis ? (
        <p className="text-xs text-red-500">Could not load previous analysis.</p>
      ) : null}

      {analysis ? (
        <article
          className="space-y-3"
          data-testid="workout-analysis-outcome"
        >
          <div className="border-l-2 border-[var(--shell-accent)] pl-3">
            <p className="text-sm font-medium text-[var(--shell-ink)]">{analysis.summary}</p>
            <p className="mt-1 text-[11px] text-[var(--shell-muted)]" data-testid="workout-analysis-timestamp">
              Last analyzed {new Date(analysis.createdAt).toLocaleString()}
            </p>
          </div>
          {(analysis.keyFindings.length > 0 || analysis.techniqueRisks.length > 0 || analysis.coachSuggestions.length > 0) ? (
            <div className="space-y-2 text-xs text-[var(--shell-muted)]">
              {analysis.keyFindings.length > 0 ? (
                <div>
                  <span className="font-semibold uppercase tracking-widest">Findings</span>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    {analysis.keyFindings.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              ) : null}
              {analysis.techniqueRisks.length > 0 ? (
                <div>
                  <span className="font-semibold uppercase tracking-widest">Risks</span>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    {analysis.techniqueRisks.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              ) : null}
              {analysis.coachSuggestions.length > 0 ? (
                <div>
                  <span className="font-semibold uppercase tracking-widest">Suggestions</span>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    {analysis.coachSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </article>
      ) : null}
    </>
  );
}
