import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { MessageSquareShareIcon } from "lucide-react";
import { getCreditPricing } from "@/services/coaches/getCreditPricing";
import { analyzeCompletedWorkoutMedia } from "@/services/completedWorkouts/analyzeCompletedWorkoutMedia";
import { getLatestCompletedWorkoutMediaAnalysis } from "@/services/completedWorkouts/getLatestCompletedWorkoutMediaAnalysis";
import { addCompletedWorkoutChatMessage } from "@/services/completedWorkouts/addCompletedWorkoutChatMessage";
import { PurchaseCreditsDialog } from "@/dialogs/PurchaseCreditsDialog/PurchaseCreditsDialog";
import { WorkoutMediaAnalysis } from "@/services/plannedWorkouts/type";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  traineeId: string;
  completedWorkoutId: string;
};

function AnalysisSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading analysis" aria-busy>
      <div className="flex flex-col gap-2 pl-3">
        <Skeleton className="h-3 w-3/4 rounded-none" />
        <Skeleton className="h-2.5 w-1/2 rounded-none" />
      </div>
      {[3, 2, 3].map((rows, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-2 w-14 rounded-none" />
          {Array.from({ length: rows }).map((_, j) => (
            <Skeleton
              key={j}
              className={`h-2 rounded-none ${j === 0 ? "w-full" : j === 1 ? "w-5/6" : "w-4/6"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function WorkoutAnalysisTrigger({
  traineeId,
  completedWorkoutId,
  isPending,
  onAnalyze,
}: Props & { isPending: boolean; onAnalyze: (text: string) => void }) {
  const [context, setContext] = useState("");

  const pricing = useQuery({
    queryKey: ["coach-credit-pricing"],
    queryFn: getCreditPricing,
  });

  const analyzeCost = useMemo(() => {
    const mediaAction = pricing.data?.find((item) => item.action === "AnalyzeCompletedWorkoutMedia");
    return mediaAction?.creditCost ?? null;
  }, [pricing.data]);

  return (
    <section className="flex flex-col gap-3" data-testid="workout-analysis-section">
      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--shell-muted)]">
          Analysis context
        </span>
        <Textarea
          value={context}
          onChange={(event) => setContext(event.target.value)}
          rows={4}
          placeholder="Optional context for analysis..."
          data-testid="workout-analysis-context"
          className="min-h-28 resize-y"
        />
      </label>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--shell-muted)]">
          Uses latest chat media.{analyzeCost ? ` ${analyzeCost} credits.` : ""}
        </p>
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={() => onAnalyze(context)}
        >
          {isPending ? "Analyzing..." : analyzeCost ? `Analyze (${analyzeCost} credits)` : "Analyze"}
        </Button>
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
  completedWorkoutId,
  isPending = false,
}: Props & { isPending?: boolean }) {
  const latestAnalysis = useQuery({
    queryKey: ["completed-workout-analysis", traineeId, completedWorkoutId],
    queryFn: ({ signal }) =>
      getLatestCompletedWorkoutMediaAnalysis({
        traineeId,
        completedWorkoutId,
        signal,
      }),
  });

  const analysis = latestAnalysis.data;

  return (
    <>
      {latestAnalysis.isError && !analysis ? (
        <p className="text-xs text-destructive">Could not load previous analysis.</p>
      ) : null}

      {isPending && !analysis ? (
        <AnalysisSkeleton />
      ) : analysis ? (
        <article className="flex flex-col gap-3" data-testid="workout-analysis-outcome">
          <div className="border-l-2 border-[var(--shell-accent)] pl-3">
            <p className="text-sm font-medium text-[var(--shell-ink)]">{analysis.summary}</p>
            <p className="mt-1 text-[11px] text-[var(--shell-muted)]" data-testid="workout-analysis-timestamp">
              Last analyzed {new Date(analysis.createdAt).toLocaleString()}
            </p>
          </div>
          {(analysis.keyFindings.length > 0 || analysis.techniqueRisks.length > 0 || analysis.coachSuggestions.length > 0) ? (
            <div className="flex flex-col gap-2 text-xs text-[var(--shell-muted)]">
              {analysis.keyFindings.length > 0 ? (
                <div>
                  <span className="font-semibold uppercase tracking-widest">Findings</span>
                  <ul className="mt-1 list-disc pl-4 flex flex-col gap-0.5">
                    {analysis.keyFindings.map((f: string, i: number) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              ) : null}
              {analysis.techniqueRisks.length > 0 ? (
                <div>
                  <span className="font-semibold uppercase tracking-widest">Risks</span>
                  <ul className="mt-1 list-disc pl-4 flex flex-col gap-0.5">
                    {analysis.techniqueRisks.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              ) : null}
              {analysis.coachSuggestions.length > 0 ? (
                <div>
                  <span className="font-semibold uppercase tracking-widest">Suggestions</span>
                  <ul className="mt-1 list-disc pl-4 flex flex-col gap-0.5">
                    {analysis.coachSuggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
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

export function WorkoutAnalysis({ traineeId, completedWorkoutId }: Props) {
  const queryClient = useQueryClient();
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  const analyze = useMutation({
    mutationFn: async (text: string) =>
      analyzeCompletedWorkoutMedia({
        traineeId,
        completedWorkoutId,
        analysis: { text },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["completed-workout-analysis", traineeId, completedWorkoutId],
      });
    },
  });

  const latestAnalysis = useQuery({
    queryKey: ["completed-workout-analysis", traineeId, completedWorkoutId],
    queryFn: ({ signal }) =>
      getLatestCompletedWorkoutMediaAnalysis({
        traineeId,
        completedWorkoutId,
        signal,
      }),
  });

  const shareToChat = useMutation({
    mutationFn: async () => {
      const analysis = latestAnalysis.data;
      if (!analysis) {
        throw new Error("No analysis available to share.");
      }

      return addCompletedWorkoutChatMessage({
        traineeId,
        completedWorkoutId,
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
        queryKey: ["completed-workout-chat", traineeId, completedWorkoutId],
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
    <div className="flex flex-col gap-4">
      <WorkoutAnalysisSection
        traineeId={traineeId}
        completedWorkoutId={completedWorkoutId}
        isPending={analyze.isPending}
      />

      {latestAnalysis.data ? (
        <>
        <Separator />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[var(--shell-muted)]">
            Share this analysis directly in the athlete chat for this workout.
          </p>
          <div className="flex items-center gap-2">
            {shareSuccess ? (
              <span className="text-xs font-semibold text-[var(--shell-accent)]">
                {shareSuccess}
              </span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={shareToChat.isPending}
              onClick={() => shareToChat.mutate()}
            >
              <MessageSquareShareIcon data-icon="inline-start" />
              {shareToChat.isPending ? "Sharing..." : "Share in chat"}
            </Button>
          </div>
        </div>
        </>
      ) : null}

      {analyze.isError ? (
        <AnalysisError
          error={analyze.error}
          onBuyCredits={() => setPurchaseDialogOpen(true)}
        />
      ) : null}

      <WorkoutAnalysisTrigger
        traineeId={traineeId}
        completedWorkoutId={completedWorkoutId}
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
        <Button
          type="button"
          variant="link"
          size="sm"
          className="shrink-0 px-0"
          onClick={onBuyCredits}
        >
          Buy credits
        </Button>
      </div>
    );
  }

  return <p className="text-xs text-destructive">Could not analyze this check-in right now.</p>;
}
