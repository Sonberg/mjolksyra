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

function AnalysisSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading analysis" aria-busy>
      <div className="border-l-2 border-[var(--shell-accent)] pl-3 space-y-2">
        <div className="h-3 w-3/4 rounded bg-[var(--shell-border)] animate-pulse" />
        <div className="h-2.5 w-1/2 rounded bg-[var(--shell-border)] animate-pulse" />
      </div>
      {[3, 2, 3].map((rows, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-2 w-14 rounded bg-[var(--shell-border)] animate-pulse" />
          {Array.from({ length: rows }).map((_, j) => (
            <div
              key={j}
              className={`h-2 rounded bg-[var(--shell-border)] animate-pulse ${
                j === 0 ? "w-full" : j === 1 ? "w-5/6" : "w-4/6"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function WorkoutAnalysisTrigger({
  traineeId,
  plannedWorkoutId,
  isPending,
  onAnalyze,
}: Props & { isPending: boolean; onAnalyze: (text: string) => void }) {
  const [context, setContext] = useState("");

  const pricing = useQuery({
    queryKey: ["coach-credit-pricing"],
    queryFn: getCreditPricing,
  });

  const analyzeCost = useMemo(() => {
    const mediaAction = pricing.data?.find((item) => item.action === "AnalyzeWorkoutMedia");
    return mediaAction?.creditCost ?? null;
  }, [pricing.data]);

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
          disabled={isPending}
          onClick={() => onAnalyze(context)}
          className="shrink-0 border border-transparent bg-[var(--shell-accent)] px-3 py-1.5 text-[11px] font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
        >
          {isPending ? "Analyzing..." : analyzeCost ? `Analyze (${analyzeCost} credits)` : "Analyze"}
        </button>
      </div>
    </section>
  );
}

export function WorkoutAnalysisSection({
  traineeId,
  plannedWorkoutId,
  isPending = false,
}: Props & { isPending?: boolean }) {
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

      {isPending && !analysis ? (
        <AnalysisSkeleton />
      ) : analysis ? (
        <article className="space-y-3" data-testid="workout-analysis-outcome">
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

export function WorkoutAnalysis({ traineeId, plannedWorkoutId }: Props) {
  const queryClient = useQueryClient();

  const analyze = useMutation({
    mutationFn: async (text: string) =>
      analyzeWorkoutMedia({
        traineeId,
        plannedWorkoutId,
        analysis: { text },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["planned-workout-analysis", traineeId, plannedWorkoutId],
      });
    },
  });

  return (
    <div className="space-y-4">
      <WorkoutAnalysisSection
        traineeId={traineeId}
        plannedWorkoutId={plannedWorkoutId}
        isPending={analyze.isPending}
      />

      {analyze.isError ? (
        <AnalysisError error={analyze.error} />
      ) : null}

      <WorkoutAnalysisTrigger
        traineeId={traineeId}
        plannedWorkoutId={plannedWorkoutId}
        isPending={analyze.isPending}
        onAnalyze={(text) => analyze.mutate(text)}
      />
    </div>
  );
}

function AnalysisError({ error }: { error: Error }) {
  const message = useMemo(() => {
    if (error instanceof AxiosError && error.response?.status === 422) {
      const data = error.response.data;
      const detail =
        typeof data === "object" && data !== null ? (data as { error?: string }).error : null;
      return detail ?? "Not enough credits to analyze this check-in.";
    }
    return "Could not analyze this check-in right now.";
  }, [error]);

  return <p className="text-xs text-red-500">{message}</p>;
}
