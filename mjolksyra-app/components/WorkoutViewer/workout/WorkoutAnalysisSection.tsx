import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { MessageSquareShareIcon } from "lucide-react";
import { getCreditPricing } from "@/services/coaches/getCreditPricing";
import { analyzeWorkoutMedia } from "@/services/plannedWorkouts/analyzeWorkoutMedia";
import { getLatestWorkoutMediaAnalysis } from "@/services/plannedWorkouts/getLatestWorkoutMediaAnalysis";
import { addPlannedWorkoutChatMessage } from "@/services/plannedWorkouts/addPlannedWorkoutChatMessage";
import { PurchaseCreditsDialog } from "@/dialogs/PurchaseCreditsDialog/PurchaseCreditsDialog";
import { WorkoutMediaAnalysis } from "@/services/plannedWorkouts/type";

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
      <label className="block space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--shell-muted)]">
          Analysis context
        </span>
        <textarea
          value={context}
          onChange={(event) => setContext(event.target.value)}
          rows={4}
          placeholder="Optional context for analysis..."
          data-testid="workout-analysis-context"
          className="min-h-28 w-full resize-y border border-[var(--shell-border)] bg-[var(--shell-card)] px-3 py-2 text-sm leading-6 text-[var(--shell-ink)] outline-none transition focus:border-[var(--shell-accent)] focus:bg-[var(--shell-background)] placeholder:text-[var(--shell-muted)]"
        />
      </label>

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

function buildAnalysisShareMessage(analysis: WorkoutMediaAnalysis) {
  const sections = [
    `AI workout analysis`,
    "",
    `Summary: ${analysis.summary}`,
  ];

  if (analysis.keyFindings.length > 0) {
    sections.push("", "Key findings:");
    sections.push(...analysis.keyFindings.map((item) => `- ${item}`));
  }

  if (analysis.techniqueRisks.length > 0) {
    sections.push("", "Technique risks:");
    sections.push(...analysis.techniqueRisks.map((item) => `- ${item}`));
  }

  if (analysis.coachSuggestions.length > 0) {
    sections.push("", "Coach suggestions:");
    sections.push(...analysis.coachSuggestions.map((item) => `- ${item}`));
  }

  return sections.join("\n");
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
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

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

  const latestAnalysis = useQuery({
    queryKey: ["planned-workout-analysis", traineeId, plannedWorkoutId],
    queryFn: ({ signal }) =>
      getLatestWorkoutMediaAnalysis({
        traineeId,
        plannedWorkoutId,
        signal,
      }),
  });

  const shareToChat = useMutation({
    mutationFn: async () => {
      const analysis = latestAnalysis.data;
      if (!analysis) {
        throw new Error("No analysis available to share.");
      }

      return addPlannedWorkoutChatMessage({
        traineeId,
        plannedWorkoutId,
        message: {
          message: buildAnalysisShareMessage(analysis),
          mediaUrls: [],
          role: "Coach",
        },
      });
    },
    onSuccess: async () => {
      setShareSuccess("Shared in workout chat.");
      await queryClient.invalidateQueries({
        queryKey: ["planned-workout-chat", traineeId, plannedWorkoutId],
      });
    },
  });

  const isInsufficientCredits =
    analyze.isError &&
    analyze.error instanceof AxiosError &&
    analyze.error.response?.status === 422;

  useEffect(() => {
    if (isInsufficientCredits) {
      setPurchaseDialogOpen(true);
    }
  }, [isInsufficientCredits]);

  useEffect(() => {
    if (!shareSuccess) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShareSuccess(null);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [shareSuccess]);

  return (
    <div className="space-y-4">
      <WorkoutAnalysisSection
        traineeId={traineeId}
        plannedWorkoutId={plannedWorkoutId}
        isPending={analyze.isPending}
      />

      {latestAnalysis.data ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--shell-border)] pt-3">
          <p className="text-xs text-[var(--shell-muted)]">
            Share this analysis directly in the athlete chat for this workout.
          </p>
          <div className="flex items-center gap-2">
            {shareSuccess ? (
              <span className="text-xs font-semibold text-[var(--shell-accent)]">
                {shareSuccess}
              </span>
            ) : null}
            <button
              type="button"
              disabled={shareToChat.isPending}
              onClick={() => shareToChat.mutate()}
              className="inline-flex items-center gap-1.5 border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-1.5 text-[11px] font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:opacity-60"
            >
              <MessageSquareShareIcon className="h-3.5 w-3.5" />
              {shareToChat.isPending ? "Sharing..." : "Share in chat"}
            </button>
          </div>
        </div>
      ) : null}

      {analyze.isError ? (
        <AnalysisError
          error={analyze.error}
          onBuyCredits={() => setPurchaseDialogOpen(true)}
        />
      ) : null}

      <WorkoutAnalysisTrigger
        traineeId={traineeId}
        plannedWorkoutId={plannedWorkoutId}
        isPending={analyze.isPending}
        onAnalyze={(text) => analyze.mutate(text)}
      />

      <PurchaseCreditsDialog
        open={purchaseDialogOpen}
        onOpenChange={(open) => {
          setPurchaseDialogOpen(open);
          if (!open) analyze.reset();
        }}
        onPurchased={() => analyze.reset()}
      />
    </div>
  );
}

function AnalysisError({ error, onBuyCredits }: { error: Error; onBuyCredits: () => void }) {
  const isInsufficientCredits =
    error instanceof AxiosError && error.response?.status === 422;

  if (isInsufficientCredits) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--shell-muted)]">Not enough credits.</p>
        <button
          type="button"
          onClick={onBuyCredits}
          className="shrink-0 text-xs font-semibold text-[var(--shell-accent)] underline-offset-2 hover:underline"
        >
          Buy credits
        </button>
      </div>
    );
  }

  return <p className="text-xs text-red-500">Could not analyze this check-in right now.</p>;
}
